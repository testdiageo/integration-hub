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
      <xsl:element name="orders_id"><xsl:value-of select="*[local-name()='id']"/></xsl:element>
      <xsl:element name="orders_client"><xsl:value-of select="*[local-name()='customer']"/></xsl:element>
      <xsl:element name="orders_total"><xsl:value-of select="*[local-name()='amount']"/></xsl:element>
    </transformedRecord>
  </xsl:template>
</xsl:stylesheet>