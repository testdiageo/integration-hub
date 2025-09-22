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
      <xsl:element name="uid"><xsl:value-of select="*[local-name()='id']"/></xsl:element>
      <xsl:element name="full_name"><xsl:value-of select="*[local-name()='name']"/></xsl:element>
    </transformedRecord>
  </xsl:template>
</xsl:stylesheet>