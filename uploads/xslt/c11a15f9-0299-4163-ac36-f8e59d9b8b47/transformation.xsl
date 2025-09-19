<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  <xsl:template match="/">
    <root>
      <name><xsl:value-of select="//name"/></name>
      <value><xsl:value-of select="//value"/></value>
    </root>
  </xsl:template>
</xsl:stylesheet>