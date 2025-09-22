%dw 2.0
output application/json
---
{
  root: payload..record map (r) -> {
    transformedRecord: {
      CODDIV: r."VKORG",
      CODLIST: r."KSCHL",
      CODART: r."MATNR",
      DTEFROMDETAIL: (r."DATAB" as String) replace /(.{4})(.{2})(.{2})/ with "$1-$2-$3" replace " " with "T",
      DTETODETAIL: (r."DATBI" as String) replace /(.{4})(.{2})(.{2})/ with "$1-$2-$3" replace " " with "T",
      UMPRZ: r."KMEIN",
      PRZVALPVP: r."KBETR",
      DISTR_CHAN: r."VTWEG"
    }
  }
}