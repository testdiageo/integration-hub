<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  
  <!-- Root template -->
  <xsl:template match="/">
    <root>
      <xsl:apply-templates select="//record"/>
    </root>
  </xsl:template>
  
  <!-- Record transformation template -->
  <xsl:template match="record">
    <transformedRecord>
      <xsl:element name="CODDIV"><xsl:value-of select="*[local-name()='Source Field']"/></xsl:element>
      <xsl:element name="CODLIST"><xsl:value-of select="*[local-name()='Target Field']"/></xsl:element>
    </transformedRecord>
  </xsl:template>
</xsl:stylesheet>