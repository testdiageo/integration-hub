<?xml version="1.0" encoding="UTF-8"?>
  <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text"/>
    <xsl:template match="/">
      {"name": "<xsl:value-of select="root/record/name"/>", "value": <xsl:value-of select="root/record/value"/>}
    </xsl:template>
  </xsl:stylesheet>