---
title: BR Conselhos Authentication API
description: SOAP-based authentication service for validating legal professionals using BR Conselhos credentials (CPF/CNPJ).
tags: [brconselhos, authentication, soap, api, oab, integration]
---

# BR Conselhos – Authentication Web Service

This document describes the integration with the **BR Conselhos Authentication Web Service (WSAutenticar)**, used to validate legal professionals by delegating authentication logic directly to BR Conselhos systems.

The service authenticates users using **CPF or CNPJ** credentials and returns authoritative professional and personal registry data.

---

## Overview

- **Protocol:** SOAP 1.1 (XML over HTTP)
- **Web Method:** `Autenticar`
- **Service Page:** `WSAutenticar.asmx`
- **Purpose:** Authenticate professionals and retrieve official registry data
- **Authentication Model:** Username (CPF/CNPJ) + password
- **Additional Credentials Required:** ❌ No
- **IP Whitelisting Required:** ❌ No
- **Technical/API User Required:** ❌ No

All authentication logic and validation rules are fully handled by **BR Conselhos**.

---

## Endpoints

### Homologation (Test Environment)

```
https://homolog.oab-sc.org.br/BRConselhos_HML/WSAutenticar/WSAutenticar.asmx
```

### Production

```
https://servicos.oab-sc.org.br/WSAutenticar/WSAutenticar.asmx?op=Autenticar
```

---

## Authentication Rules

- The login identifier **must be CPF or CNPJ**
- OAB numbers or custom usernames are **not supported**
- Credentials are validated directly against BR Conselhos
- This integration **only validates authentication**, not authorization

---

## Request

### HTTP Method

```
POST
```

### Headers

| Header       | Value                     |
| ------------ | ------------------------- |
| Content-Type | `text/xml; charset=utf-8` |

---

### SOAP Request Example

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Autenticar xmlns="http://tempuri.org/">
      <Usuario>004.636.789-66</Usuario>
      <Senha>your_password_here</Senha>
    </Autenticar>
  </soap:Body>
</soap:Envelope>
```

#### Parameters

| Field     | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `Usuario` | string | ✅ Yes   | CPF or CNPJ registered in BR Conselhos |
| `Senha`   | string | ✅ Yes   | User password                          |

---

## Response

The service always returns a **string containing an XML payload**.

### Authentication Failure

```xml
<XML>
  <Status>Usuário e Senha inválidos</Status>
</XML>
```

### Authentication Success

```xml
<XML>
  <Status>OK</Status>
  <Cadastro>
    ...
  </Cadastro>
</XML>
```

---

## Returned Data (Successful Authentication)

When authentication is successful, the `<Cadastro>` node may include the following fields:

### BRConselhosUserData

```ts
BRConselhosUserData {
  status: string
  registroConselho?: string
  registroConselhoTemporario?: string
  nome?: string
  dataNascimento?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  estado?: string
  pais?: string
  estadoCivil?: string
  nomeMae?: string
  nomePai?: string
  emailComercial?: string
  telefoneComercial?: string
  telefone2Comercial?: string
  subunidade?: string
  dataAcordao?: string
  dataAcordaoEstagiario?: string
  inadimplente?: string
  situacaoAtual?: string
  jovemAdvogado?: string
  cpfCnpj?: string
  rg?: string
  orgaoEmissorRG?: string
  dataEmissaoRG?: string
  loginUser?: string
  dtInscricao?: string
  subsecao?: string
}
```

> ⚠️ Not all fields are guaranteed to be present. Field availability depends on the professional's registry data in BR Conselhos.

---

## Behavior Guarantees

- The XML structure described in the official BR Conselhos manual **matches the current production response**
- Status values:
  - `OK` → Authentication successful
  - Any other value → Authentication failed
- The service does **not** return HTTP errors for invalid credentials, only XML status

---

## Integration Intent

This service should be used exclusively to:

- Validate professional credentials
- Delegate authentication responsibility to BR Conselhos
- Retrieve authoritative professional registry data

Business rules, authorization, and access control must be handled by the consuming system.

---

## Notes & Best Practices

- Always parse and validate the `<Status>` field before consuming registry data
- Apply timeouts and retries carefully (SOAP services may be slow)
- Mask sensitive personal data (CPF, RG) in logs
- Do not cache passwords or authentication responses
- Consider wrapping this SOAP service with an internal REST adapter if needed
