%dw 2.0
output application/json
---
{
  root: payload..record map (r) -> {
    transformedRecord: {
      CODDIV: r."VKORG",
      CODLIST: r."KSCHL",
      CODART: (r."MATNR" as String as Number) as String { format: "0000000000" },
      DTEFROMDETAIL: r."DATAB",
      DTETODETAIL: r."DATBI",
      UMPRZ: r."KMEIN",
      PRZVALPVP: r."KBETR",
      DISTR_CHAN: r."VTWEG" as String
    }
  }
}