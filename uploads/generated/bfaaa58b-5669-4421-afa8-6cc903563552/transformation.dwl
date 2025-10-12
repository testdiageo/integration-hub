%dw 2.0
output application/json
---
{
  root: payload..record map (r) -> {
    transformedRecord: {
      CODDIV: r."Source Field",
      CODLIST: r."Target Field"
    }
  }
}