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
      <xsl:element name="CODDIV"><xsl:value-of select="*[local-name()='VKORG']"/></xsl:element>
      <xsl:element name="CODLIST"><xsl:value-of select="*[local-name()='KSCHL']"/></xsl:element>
      <xsl:element name="CODART"><xsl:value-of select="*[local-name()='MATNR']"/></xsl:element>
      <xsl:element name="DTEFROMDETAIL"><xsl:value-of select="*[local-name()='DATAB']"/></xsl:element>
      <xsl:element name="DTETODETAIL"><xsl:value-of select="*[local-name()='DATBI']"/></xsl:element>
      <xsl:element name="UMPRZ"><xsl:value-of select="*[local-name()='KMEIN']"/></xsl:element>
      <xsl:element name="PRZVALPVP"><xsl:value-of select="*[local-name()='KBETR']"/></xsl:element>
      <xsl:element name="DISTR_CHAN"><xsl:value-of select="*[local-name()='VTWEG']"/></xsl:element>
      <xsl:element name="DIVISION"><xsl:value-of select="*[local-name()='VKORG']"/></xsl:element>
    </transformedRecord>
  </xsl:template>
</xsl:stylesheet>