//----------------------------------------------------------
// Copyright (C) Microsoft Corporation. All rights reserved.
// Released under the Microsoft Office Extensible File License
// https://raw.github.com/stephen-hardy/xlsx.js/master/LICENSE.txt
//----------------------------------------------------------
function xlsx(file) { // v1.1.0
	var result, zip = new JSZip(), zipTime, processTime, s, i, j, k, l, t, w, sharedStrings, index,
		docProps, xl, xlWorksheets, worksheet, contentTypes = [[], []], props = [], xlRels = [], worksheets = [], id;
	function alphabet(i) { var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', t = Math.floor(i / 26) - 1; return (t > -1 ? alphabet(t) : '') + s.charAt(i % 26); }
	
	if (typeof file === 'string') { // Load
		zipTime = +new Date();
		zip = zip.load(file, { base64: true });
		result = { worksheets: [], zipTime: +new Date() - zipTime };
		processTime = +new Date();
		
		//{ Process sharedStrings
			sharedStrings = [];
			s = zip.files['xl/sharedStrings.xml'].data.split('<t>');
			i = s.length;
			while(--i) { sharedStrings[i - 1] = s[i].substring(0, s[i].indexOf('<')); } // Do not process i === 0, because s[0] is the text before first t element
		//}
		
		//{ Get file info from "docProps/core.xml"
			s = zip.files['docProps/core.xml'].data;
			s = s.substr(s.indexOf('<dc:creator>') + 12);
			result.creator = s.substring(0, s.indexOf('</dc:creator>'));
			s = s.substr(s.indexOf('<cp:lastModifiedBy>') + 19);
			result.lastModifiedBy = s.substring(0, s.indexOf('</cp:lastModifiedBy>'));			
			s = s.substr(s.indexOf('<dcterms:created xsi:type="dcterms:W3CDTF">') + 43);
			result.created = new Date(s.substring(0, s.indexOf('</dcterms:created>')));			
			s = s.substr(s.indexOf('<dcterms:modified xsi:type="dcterms:W3CDTF">') + 44);
			result.modified = new Date(s.substring(0, s.indexOf('</dcterms:modified>')));
		//}
		//{ Get workbook info from "xl/workbook.xml" - Worksheet names exist in other places, but "activeTab" attribute must be gathered from this file anyway
			s = zip.files['xl/workbook.xml'].data;
			i = s.indexOf('activeTab="');
			if (i > 0) {
				s = s.substr(i + 11); // Must eliminate first 11 characters before finding the index of " on the next line. Otherwise, it finds the " before the value.
				result.activeWorksheet = +s.substring(0, s.indexOf('"'));
			}
			else { result.activeWorksheet = 0; }
			s = s.split('<sheet ');
			i = s.length;
			while (--i) { // Do not process i === 0, because s[0] is the text before the first sheet element
				result.worksheets.unshift([]);
				id = s[i].substr(s[i].indexOf('name="') + 6);
				result.worksheets[0].name = id.substring(0, id.indexOf('"'));
			}
		//}
		//{ Get worksheet info from "xl/worksheets/sheetX.xml"
			i = result.worksheets.length;
			while (i--) {
				s = zip.files['xl/worksheets/sheet' + (i + 1) + '.xml'].data.split('<row ');
				w = result.worksheets[i];
				w.table = s[0].indexOf('<tableParts ') > 0;
				j = s.length;
				while (--j) { // Don't process j === 0, because s[0] is the text before the first row element
					w.unshift([]);
					k = s[j].split('<c ');
					l = k.length;
					while (--l) { // Don't process l === 0, because k[0] is the text before the first c (cell) element
						t = k[l];
						index = t.indexOf('t="s"') > 0;
						t = t.substring(t.indexOf('<v>') + 3, t.indexOf('</v>'));
						t = t ? +t : '';
						w[0].unshift(index ? sharedStrings[t] : t);
					}
				}
			}
		//}
		result.processTime = +new Date() - processTime;
	}
	else { // Save
		processTime = +new Date();
		sharedStrings = [[], 0];
		//{ Fully static
			zip.folder('_rels').file('.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
			docProps = zip.folder('docProps');
			
			xl = zip.folder('xl');
			xl.folder('theme').file('theme1.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme"><a:themeElements><a:clrScheme name="Office"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1F497D"/></a:dk2><a:lt2><a:srgbClr val="EEECE1"/></a:lt2><a:accent1><a:srgbClr val="4F81BD"/></a:accent1><a:accent2><a:srgbClr val="C0504D"/></a:accent2><a:accent3><a:srgbClr val="9BBB59"/></a:accent3><a:accent4><a:srgbClr val="8064A2"/></a:accent4><a:accent5><a:srgbClr val="4BACC6"/></a:accent5><a:accent6><a:srgbClr val="F79646"/></a:accent6><a:hlink><a:srgbClr val="0000FF"/></a:hlink><a:folHlink><a:srgbClr val="800080"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Cambria"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Times New Roman"/><a:font script="Hebr" typeface="Times New Roman"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="MoolBoran"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Times New Roman"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/><a:font script="Jpan" typeface="MS P????"/><a:font script="Hang" typeface="?? ??"/><a:font script="Hans" typeface="??"/><a:font script="Hant" typeface="????"/><a:font script="Arab" typeface="Arial"/><a:font script="Hebr" typeface="Arial"/><a:font script="Thai" typeface="Tahoma"/><a:font script="Ethi" typeface="Nyala"/><a:font script="Beng" typeface="Vrinda"/><a:font script="Gujr" typeface="Shruti"/><a:font script="Khmr" typeface="DaunPenh"/><a:font script="Knda" typeface="Tunga"/><a:font script="Guru" typeface="Raavi"/><a:font script="Cans" typeface="Euphemia"/><a:font script="Cher" typeface="Plantagenet Cherokee"/><a:font script="Yiii" typeface="Microsoft Yi Baiti"/><a:font script="Tibt" typeface="Microsoft Himalaya"/><a:font script="Thaa" typeface="MV Boli"/><a:font script="Deva" typeface="Mangal"/><a:font script="Telu" typeface="Gautami"/><a:font script="Taml" typeface="Latha"/><a:font script="Syrc" typeface="Estrangelo Edessa"/><a:font script="Orya" typeface="Kalinga"/><a:font script="Mlym" typeface="Kartika"/><a:font script="Laoo" typeface="DokChampa"/><a:font script="Sinh" typeface="Iskoola Pota"/><a:font script="Mong" typeface="Mongolian Baiti"/><a:font script="Viet" typeface="Arial"/><a:font script="Uigh" typeface="Microsoft Uighur"/><a:font script="Geor" typeface="Sylfaen"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="1"/></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:shade val="51000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="80000"><a:schemeClr val="phClr"><a:shade val="93000"/><a:satMod val="130000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="94000"/><a:satMod val="135000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="16200000" scaled="0"/></a:gradFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst></a:effectStyle><a:effectStyle><a:effectLst><a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw></a:effectLst><a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d><a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path></a:gradFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>');
			xlWorksheets = xl.folder('worksheets');
			xl.file('styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><fonts count="1" x14ac:knownFonts="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/><extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst></styleSheet>');
		//}
		//{ Not content dependent
			docProps.file('core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>'
				+ (file.creator || 'XLSX.js') + '</dc:creator><cp:lastModifiedBy>' + (file.lastModifiedBy || 'XLSX.js') + '</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">'
				+ (file.created || new Date()).toISOString() + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + (file.modified || new Date()).toISOString() + '</dcterms:modified></cp:coreProperties>');
		//}
		//{ Content dependent
			w = file.worksheets.length;
			while (w--) { // Generate worksheet (gather sharedStrings), and possibly table files, then generate entries for constant files below
				id = w + 1;
				//{ Generate sheetX.xml in var s
					worksheet = file.worksheets[w];
					s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">'
						+ '<dimension ref="A1:' + alphabet(worksheet[0].length - 1) + worksheet.length + '"/><sheetViews><sheetView ' + (w === file.activeWorksheet ? 'tabSelected="1" ' : '')
						+ ' workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15" x14ac:dyDescent="0.25"/><sheetData>';
					
					i = -1; l = worksheet.length;
					while (++i < l) {
						j = -1; k = worksheet[i].length;
						s += '<row r="' + (i + 1) + '" spans="1:' + k + '" x14ac:dyDescent="0.25">';
						while (++j < k) {
							t = worksheet[i][j];
							if (t && isNaN(parseFloat(t)) || !isFinite(t)) { // If value is text, place a sharedString reference instead of the value (use parseInt because +emptyString === 0)
								sharedStrings[1]++; // Increment total count, unique count derived from sharedStrings[0].length
								index = sharedStrings[0].indexOf(t);
								if (index < 0) { index = sharedStrings[0].push(t) - 1; }
								s += '<c r="' + alphabet(j) + (i + 1) + '" t="s"><v>' + index + '</v></c>'; 
							}
							else { s += '<c r="' + alphabet(j) + (i + 1) + '"><v>' + t + '</v></c>'; }
						}
						s += '</row>';
					}
					s += '</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>';
					if (worksheet.table) { s += '<tableParts count="1"><tablePart r:id="rId1"/></tableParts>'; }
					xlWorksheets.file('sheet' + id + '.xml', s + '</worksheet>');
				//}
				
				if (worksheet.table) {
					i = -1, l = worksheet[0].length;
					s = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="'
						+ id + '" name="Table' + id + '" displayName="Table' + id + '" ref="A1:' + alphabet(worksheet[0].length - 1) + worksheet.length
						+ '" totalsRowShown="0"><autoFilter ref="A1:' + alphabet(worksheet[0].length - 1) + worksheet.length + '"/><tableColumns count="' + worksheet[0].length + '">';
					while (++i < l) { s += '<tableColumn id="' + (i + 1) + '" name="' + worksheet[0][i] + '"/>'; }
					s += '</tableColumns><tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/></table>';
					
					xl.folder('tables').file('table' + id + '.xml', s);
					xlWorksheets.folder('_rels').file('sheet' + id + '.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table' + id + '.xml"/></Relationships>');
					contentTypes[1].unshift('<Override PartName="/xl/tables/table' + id + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/>');
				}
				
				contentTypes[0].unshift('<Override PartName="/xl/worksheets/sheet' + id + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>');
				props.unshift(worksheet.name || 'Sheet' + id);
				xlRels.unshift('<Relationship Id="rId' + id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + id + '.xml"/>');
				worksheets.unshift('<sheet name="' + (worksheet.name || 'Sheet' + id) + '" sheetId="' + id + '" r:id="rId' + id + '"/>');
			}
			//{ [Content_Types].xml
				zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
					+ contentTypes[0].join('') + '<Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
					+ contentTypes[1].join('') + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>');
			//}
			//{ docProps/app.xml
				docProps.file('app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>XLSX.js</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>'
					+ file.worksheets.length + '</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="' + props.length + '" baseType="lpstr"><vt:lpstr>' + props.join('</vt:lpstr><vt:lpstr>')
					+ '</vt:lpstr></vt:vector></TitlesOfParts><Manager></Manager><Company>Microsoft Corporation</Company><LinksUpToDate>false</LinksUpToDate><SharedDoc>false</SharedDoc><HyperlinksChanged>false</HyperlinksChanged><AppVersion>1.0</AppVersion></Properties>');
			//}
			//{ xl/_rels/workbook.xml.rels
				xl.folder('_rels').file('workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
					+ xlRels.join('') + '<Relationship Id="rId' + (xlRels.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>'
					+ '<Relationship Id="rId' + (xlRels.length + 2) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
					+ '<Relationship Id="rId' + (xlRels.length + 3) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>');
			//}
			//{ xl/sharedStrings.xml
				xl.file('sharedStrings.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="'
					+ sharedStrings[1] + '" uniqueCount="' + sharedStrings[0].length + '"><si><t>' + sharedStrings[0].join('</t></si><si><t>') + '</t></si></sst>');
			//}
			//{ xl/workbook.xml
				xl.file('workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
					+ '<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303"/><workbookPr defaultThemeVersion="124226"/><bookViews><workbookView '
					+ (file.activeWorksheet ? 'activeTab="' + file.activeWorksheet + '" ' : '') + 'xWindow="480" yWindow="60" windowWidth="18195" windowHeight="8505"/></bookViews><sheets>'
					+ worksheets.join('') + '</sheets><calcPr calcId="145621"/></workbook>');
			//}
		//}
		processTime = +new Date() - processTime;
		zipTime = +new Date();
		result = { 
			base64: zip.generate({ compression: 'DEFLATE' }), zipTime: +new Date() - zipTime, processTime: processTime,
			href: function() { return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + this.base64; }
		}
	}
	return result;
}