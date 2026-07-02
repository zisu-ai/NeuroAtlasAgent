import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outDir = "outputs/annotation-template";
const previewDir = `${outDir}/previews`;
await fs.mkdir(previewDir, { recursive: true });

const wb = Workbook.create();
const navy = "#17365D";
const blue = "#D9EAF7";
const yellow = "#FFF2CC";
const green = "#E2F0D9";
const red = "#F4CCCC";
const gray = "#E7E6E6";
const white = "#FFFFFF";

function base(sheet, freezeRows = 1) {
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(freezeRows);
}

function title(sheet, range, text) {
  sheet.getRange(range).merge();
  const cell = sheet.getRange(range.split(":")[0]);
  cell.values = [[text]];
  cell.format = {
    fill: navy,
    font: { bold: true, color: white, size: 16 },
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 30;
}

function header(sheet, range) {
  sheet.getRange(range).format = {
    fill: navy,
    font: { bold: true, color: white },
    wrapText: true,
    verticalAlignment: "center",
    borders: { preset: "inside", style: "thin", color: "#A6A6A6" },
  };
  sheet.getRange(range).format.rowHeight = 36;
}

function inputs(sheet, range) {
  sheet.getRange(range).format = {
    fill: yellow,
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "inside", style: "thin", color: "#D9D9D9" },
  };
}

function checks(sheet, range) {
  sheet.getRange(range).format = {
    fill: blue,
    wrapText: true,
    verticalAlignment: "top",
    borders: { preset: "inside", style: "thin", color: "#D9D9D9" },
  };
}

function setWidths(sheet, widths) {
  widths.forEach(([range, width]) => { sheet.getRange(range).format.columnWidth = width; });
}

function listValidation(sheet, range, formula1) {
  sheet.getRange(range).dataValidation = { rule: { type: "list", formula1 } };
}

// Codebook must exist before validation references are assigned.
const code = wb.worksheets.add("Codebook");
base(code);
const entityTypes = ["SurgicalApproach", "AnatomicalSpace", "CranialNerve", "Artery", "Vein", "BrainStructure", "BoneLandmark", "DuralStructure", "SurgicalCorridor", "Other"];
const predicates = ["adjacent_to", "anterior_to", "posterior_to", "superior_to", "inferior_to", "medial_to", "lateral_to", "contains", "traverses", "supplies", "drains_into", "exposes", "provides_access_to", "obscures", "at_risk_during"];
const confidence = ["1-低", "2", "3-中", "4", "5-高"];
const statuses = ["待标注", "已完成", "需讨论", "已裁决", "排除"];
const questionTypes = ["单跳事实", "空间关系", "多跳推理", "同义词缩写", "不可回答", "错误前提"];
const yesNo = ["是", "否"];
code.getRange("A1:F1").values = [["EntityType", "Predicate", "Confidence", "Status", "QuestionType", "YesNo"]];
const maxLen = Math.max(entityTypes.length, predicates.length, confidence.length, statuses.length, questionTypes.length, yesNo.length);
const codeRows = Array.from({ length: maxLen }, (_, i) => [entityTypes[i] ?? null, predicates[i] ?? null, confidence[i] ?? null, statuses[i] ?? null, questionTypes[i] ?? null, yesNo[i] ?? null]);
code.getRange(`A2:F${maxLen + 1}`).values = codeRows;
header(code, "A1:F1");
code.getRange(`A2:F${maxLen + 1}`).format = { borders: { preset: "inside", style: "thin", color: "#D9D9D9" } };
setWidths(code, [["A:A", 22], ["B:B", 24], ["C:F", 16]]);

const readme = wb.worksheets.add("00_README");
base(readme, 3);
title(readme, "A1:H1", "NeuroAtlasAgent 神经外科解剖双人标注模板 v1.0");
readme.getRange("A3:B13").values = [
  ["步骤", "操作"],
  ["1. 冻结范围", "仅标注乙状窦后入路/桥小脑角；不要录入患者数据或治疗建议。"],
  ["2. 登记来源", "项目负责人在 01_Sources 为每篇论文或书籍章节分配唯一 Source_ID。"],
  ["3. 独立实体标注", "标注者1填写 02_Entities_A1；标注者2填写 03_Entities_A2。标注期间不得互看。"],
  ["4. 独立关系标注", "两位标注者分别填写 04_Relations_A1 与 05_Relations_A2；每条关系必须带页码/图号/证据定位。"],
  ["5. 编写题库", "在 06_Questions 中录入问题、金标准关系、必须/禁止出现的 claim，以及是否应拒答。"],
  ["6. 分歧裁决", "负责人比较 A1/A2 后，将不一致项写入 07_Adjudication；第三位专家填写最终裁决。"],
  ["7. 质控", "查看 08_Dashboard；缺失证据、重复 ID、未裁决分歧必须归零后才能冻结版本。"],
  ["颜色", "黄色=人工输入；蓝色=自动检查/公式；绿色=已通过；红色=需处理。"],
  ["ID规则", "来源 SRC-001；实体 ENT-0001；关系 REL-0001；问题 CPA-SH-001；分歧 ADJ-0001。"],
  ["安全声明", "本模板用于研究数据构建，不是临床决策支持工具。"],
];
header(readme, "A3:B3");
readme.getRange("A4:A13").format = { fill: gray, font: { bold: true }, verticalAlignment: "top" };
readme.getRange("B4:B13").format = { wrapText: true, verticalAlignment: "top" };
readme.getRange("A3:B13").format.borders = { preset: "inside", style: "thin", color: "#D9D9D9" };
setWidths(readme, [["A:A", 20], ["B:B", 92]]);
readme.getRange("4:13").format.rowHeight = 35;

const sources = wb.worksheets.add("01_Sources");
base(sources);
const sourceHeaders = ["Source_ID*", "来源类型*", "题名*", "作者/编辑", "年份", "DOI/ISBN/URL*", "版本/卷期", "纳入章节/页码*", "许可状态*", "纳入原因", "负责人", "状态*", "备注"];
sources.getRange("A1:M1").values = [sourceHeaders];
sources.getRange("A2:M2").values = [["SRC-001", "同行评议论文", "示例：CPA 显微解剖研究（请替换）", "示例作者", 2024, "https://doi.org/example", "Vol(Issue)", "pp. 1-10 / Fig. 2", "仅可引用，不可再分发原图", "描述 CN VII–VIII 与 AICA 关系", "负责人姓名", "待标注", "此行为虚构示例"]];
header(sources, "A1:M1"); inputs(sources, "A2:M101");
listValidation(sources, "L2:L101", "='Codebook'!$D$2:$D$6");
sources.getRange("E2:E101").format.numberFormat = "0";
setWidths(sources, [["A:A", 14], ["B:B", 17], ["C:C", 35], ["D:D", 22], ["E:E", 10], ["F:F", 30], ["G:G", 16], ["H:H", 22], ["I:I", 28], ["J:J", 30], ["K:L", 14], ["M:M", 25]]);

function makeEntities(name, annotator) {
  const s = wb.worksheets.add(name); base(s);
  const heads = ["Entity_ID*", "规范名称*", "实体类型*", "同义词/缩写", "Source_ID*", "页码*", "图号", "证据定位*", "解剖上下文", "侧别", "标注者*", "置信度*", "状态*", "备注", "自动检查"];
  s.getRange("A1:O1").values = [heads];
  s.getRange("A2:O2").values = [["ENT-0001", "facial-vestibulocochlear nerve complex", "CranialNerve", "CN VII–VIII complex", "SRC-001", "p. 5", "Fig. 2B", "第2段第1句", "retrosigmoid view", "未说明", annotator, "4", "待标注", "虚构示例，请替换", null]];
  header(s, "A1:O1"); inputs(s, "A2:N201"); checks(s, "O2:O201");
  s.getRange("O2").formulas = [["=IF(A2=\"\",\"\",IF(COUNTIF($A$2:$A$201,A2)>1,\"重复ID\",IF(OR(B2=\"\",C2=\"\",E2=\"\",F2=\"\",H2=\"\",K2=\"\",L2=\"\",M2=\"\"),\"缺必填项\",\"OK\")))"]];
  s.getRange("O2:O201").fillDown();
  listValidation(s, "C2:C201", "='Codebook'!$A$2:$A$11");
  listValidation(s, "L2:L201", "='Codebook'!$C$2:$C$6");
  listValidation(s, "M2:M201", "='Codebook'!$D$2:$D$6");
  s.getRange("O2:O201").conditionalFormats.add("containsText", { text: "OK", format: { fill: green } });
  s.getRange("O2:O201").conditionalFormats.add("notContainsText", { text: "OK", format: { fill: red, font: { bold: true } } });
  setWidths(s, [["A:A", 14], ["B:B", 32], ["C:C", 20], ["D:D", 25], ["E:E", 14], ["F:G", 12], ["H:H", 22], ["I:I", 24], ["J:J", 12], ["K:M", 14], ["N:N", 24], ["O:O", 16]]);
  return s;
}
makeEntities("02_Entities_A1", "ANN-01");
makeEntities("03_Entities_A2", "ANN-02");

function makeRelations(name, annotator) {
  const s = wb.worksheets.add(name); base(s);
  const heads = ["Relation_ID*", "Subject_ID*", "Subject_Name*", "Predicate*", "Object_ID*", "Object_Name*", "Source_ID*", "页码*", "图号", "证据定位*", "原文短摘录(≤25词)", "解剖/手术上下文*", "侧别", "变异性", "明确陈述或推断*", "标注者*", "置信度*", "状态*", "备注", "自动检查"];
  s.getRange("A1:T1").values = [heads];
  s.getRange("A2:T2").values = [["REL-0001", "ENT-0002", "anterior inferior cerebellar artery", "adjacent_to", "ENT-0001", "facial-vestibulocochlear nerve complex", "SRC-001", "p. 5", "Fig. 2B", "第2段第1句", "短摘录示例，请用自己的证据替换", "retrosigmoid view", "未说明", "存在变异", "明确陈述", annotator, "4", "待标注", "虚构示例", null]];
  header(s, "A1:T1"); inputs(s, "A2:S501"); checks(s, "T2:T501");
  s.getRange("T2").formulas = [["=IF(A2=\"\",\"\",IF(COUNTIF($A$2:$A$501,A2)>1,\"重复ID\",IF(OR(B2=\"\",C2=\"\",D2=\"\",E2=\"\",F2=\"\",G2=\"\",H2=\"\",J2=\"\",L2=\"\",O2=\"\",P2=\"\",Q2=\"\",R2=\"\"),\"缺必填/证据\",IF(B2=E2,\"自环需核查\",\"OK\"))))"]];
  s.getRange("T2:T501").fillDown();
  listValidation(s, "D2:D501", "='Codebook'!$B$2:$B$16");
  listValidation(s, "Q2:Q501", "='Codebook'!$C$2:$C$6");
  listValidation(s, "R2:R501", "='Codebook'!$D$2:$D$6");
  listValidation(s, "O2:O501", "='Codebook'!$F$2:$F$3");
  s.getRange("T2:T501").conditionalFormats.add("containsText", { text: "OK", format: { fill: green } });
  s.getRange("T2:T501").conditionalFormats.add("notContainsText", { text: "OK", format: { fill: red, font: { bold: true } } });
  setWidths(s, [["A:B", 14], ["C:C", 28], ["D:D", 21], ["E:E", 14], ["F:F", 28], ["G:G", 14], ["H:I", 12], ["J:J", 20], ["K:K", 32], ["L:L", 24], ["M:O", 16], ["P:R", 14], ["S:S", 24], ["T:T", 17]]);
  return s;
}
makeRelations("04_Relations_A1", "ANN-01");
makeRelations("05_Relations_A2", "ANN-02");

const questions = wb.worksheets.add("06_Questions"); base(questions);
const qHeads = ["Question_ID*", "问题文本*", "问题类型*", "难度(1-5)*", "锚定实体ID", "金标准关系ID/路径*", "必须包含的Claims*", "禁止出现的Claims", "所需Source_ID*", "应该拒答?*", "拒答理由", "撰题者*", "复核者", "状态*", "备注", "自动检查"];
questions.getRange("A1:P1").values = [qHeads];
questions.getRange("A2:P2").values = [["CPA-SH-001", "乙状窦后入路首先显露哪个主要解剖区域？", "单跳事实", 1, "ENT-0100", "REL-0100", "乙状窦后入路显露桥小脑角", "不得声称适用于所有患者", "SRC-001", "否", null, "QWR-01", "REV-01", "待标注", "虚构示例", null]];
header(questions, "A1:P1"); inputs(questions, "A2:O501"); checks(questions, "P2:P501");
questions.getRange("P2").formulas = [["=IF(A2=\"\",\"\",IF(COUNTIF($A$2:$A$501,A2)>1,\"重复ID\",IF(OR(B2=\"\",C2=\"\",D2=\"\",F2=\"\",G2=\"\",I2=\"\",J2=\"\",L2=\"\",N2=\"\"),\"缺必填项\",IF(AND(J2=\"是\",K2=\"\"),\"缺拒答理由\",\"OK\"))))"]];
questions.getRange("P2:P501").fillDown();
listValidation(questions, "C2:C501", "='Codebook'!$E$2:$E$7");
questions.getRange("D2:D501").dataValidation = { rule: { type: "whole", operator: "between", formula1: 1, formula2: 5 } };
listValidation(questions, "J2:J501", "='Codebook'!$F$2:$F$3");
listValidation(questions, "N2:N501", "='Codebook'!$D$2:$D$6");
questions.getRange("P2:P501").conditionalFormats.add("containsText", { text: "OK", format: { fill: green } });
questions.getRange("P2:P501").conditionalFormats.add("notContainsText", { text: "OK", format: { fill: red, font: { bold: true } } });
setWidths(questions, [["A:A", 16], ["B:B", 38], ["C:C", 16], ["D:D", 12], ["E:F", 21], ["G:H", 32], ["I:I", 18], ["J:J", 13], ["K:K", 25], ["L:N", 14], ["O:O", 24], ["P:P", 18]]);

const adjudication = wb.worksheets.add("07_Adjudication"); base(adjudication);
const aHeads = ["Dispute_ID*", "对象类型*", "A1记录ID*", "A2记录ID*", "分歧字段*", "A1意见*", "A2意见*", "裁决结果*", "裁决理由*", "裁决专家*", "裁决日期*", "最终记录ID*", "状态*", "审计备注", "自动检查"];
adjudication.getRange("A1:O1").values = [aHeads];
adjudication.getRange("A2:O2").values = [["ADJ-0001", "Relation", "REL-0001", "REL-0001", "Predicate", "adjacent_to", "inferior_to", "adjacent_to", "来源仅支持毗邻，无法支持上下方向", "EXP-01", new Date("2026-07-02"), "REL-F-0001", "已裁决", "虚构示例", null]];
header(adjudication, "A1:O1"); inputs(adjudication, "A2:N501"); checks(adjudication, "O2:O501");
adjudication.getRange("K2:K501").format.numberFormat = "yyyy-mm-dd";
adjudication.getRange("O2").formulas = [["=IF(A2=\"\",\"\",IF(OR(B2=\"\",C2=\"\",D2=\"\",E2=\"\",F2=\"\",G2=\"\",H2=\"\",I2=\"\",J2=\"\",K2=\"\",L2=\"\",M2=\"\"),\"缺裁决字段\",\"OK\"))"]];
adjudication.getRange("O2:O501").fillDown();
listValidation(adjudication, "M2:M501", "='Codebook'!$D$2:$D$6");
adjudication.getRange("O2:O501").conditionalFormats.add("containsText", { text: "OK", format: { fill: green } });
adjudication.getRange("O2:O501").conditionalFormats.add("notContainsText", { text: "OK", format: { fill: red, font: { bold: true } } });
setWidths(adjudication, [["A:A", 14], ["B:B", 14], ["C:D", 14], ["E:E", 18], ["F:H", 28], ["I:I", 35], ["J:J", 15], ["K:K", 14], ["L:M", 15], ["N:N", 25], ["O:O", 18]]);

const dash = wb.worksheets.add("08_Dashboard"); base(dash, 3);
title(dash, "A1:F1", "标注进度与冻结前质控");
dash.getRange("A3:C11").values = [
  ["指标", "当前值", "冻结建议"],
  ["来源数", null, ">=5 (pilot)"],
  ["A1实体数", null, ">=100 (pilot)"],
  ["A2实体数", null, ">=100 (pilot)"],
  ["A1关系数", null, ">=100 (pilot)"],
  ["A2关系数", null, ">=100 (pilot)"],
  ["题目数", null, ">=50 (pilot)"],
  ["未完成裁决", null, "必须为0"],
  ["自动检查异常总数", null, "必须为0"],
];
dash.getRange("B4:B11").formulas = [
  ["=COUNTA('01_Sources'!$A$2:$A$101)"],
  ["=COUNTA('02_Entities_A1'!$A$2:$A$201)"],
  ["=COUNTA('03_Entities_A2'!$A$2:$A$201)"],
  ["=COUNTA('04_Relations_A1'!$A$2:$A$501)"],
  ["=COUNTA('05_Relations_A2'!$A$2:$A$501)"],
  ["=COUNTA('06_Questions'!$A$2:$A$501)"],
  ["=COUNTIF('07_Adjudication'!$M$2:$M$501,\"<>已裁决\")-COUNTBLANK('07_Adjudication'!$A$2:$A$501)"],
  ["=COUNTIF('02_Entities_A1'!$O$2:$O$201,\"<>OK\")-COUNTBLANK('02_Entities_A1'!$A$2:$A$201)+COUNTIF('03_Entities_A2'!$O$2:$O$201,\"<>OK\")-COUNTBLANK('03_Entities_A2'!$A$2:$A$201)+COUNTIF('04_Relations_A1'!$T$2:$T$501,\"<>OK\")-COUNTBLANK('04_Relations_A1'!$A$2:$A$501)+COUNTIF('05_Relations_A2'!$T$2:$T$501,\"<>OK\")-COUNTBLANK('05_Relations_A2'!$A$2:$A$501)+COUNTIF('06_Questions'!$P$2:$P$501,\"<>OK\")-COUNTBLANK('06_Questions'!$A$2:$A$501)+COUNTIF('07_Adjudication'!$O$2:$O$501,\"<>OK\")-COUNTBLANK('07_Adjudication'!$A$2:$A$501)"],
];
header(dash, "A3:C3");
dash.getRange("A4:A11").format = { fill: gray, font: { bold: true } };
dash.getRange("B4:B11").format = { fill: blue, font: { bold: true }, numberFormat: "0" };
dash.getRange("C4:C11").format = { fill: yellow };
dash.getRange("A3:C11").format.borders = { preset: "inside", style: "thin", color: "#D9D9D9" };
dash.getRange("A13:F16").values = [
  ["冻结检查清单", null, null, null, null, null],
  ["□ 两位标注者独立完成", "□ 分歧全部裁决", "□ 来源许可登记", "□ 无患者数据", "□ 测试集未泄漏", "□ 版本号已冻结"],
  ["建议导出", "保留原始A1/A2表；裁决结果另存；不要覆盖原始记录。", null, null, null, null],
  ["研究声明", "本表仅用于研究数据集构建，不用于诊疗或手术决策。", null, null, null, null],
];
dash.getRange("A13:F13").merge(); dash.getRange("A13").format = { fill: navy, font: { bold: true, color: white } };
dash.getRange("A15:A16").format = { fill: gray, font: { bold: true } };
dash.getRange("B15:F15").merge(); dash.getRange("B16:F16").merge();
dash.getRange("A13:F16").format.wrapText = true;
setWidths(dash, [["A:A", 24], ["B:B", 20], ["C:C", 20], ["D:F", 20]]);

// Compact visual formatting and previews for every sheet.
for (const sheet of wb.worksheets.items) {
  const used = sheet.getUsedRange();
  if (used) used.format.font = { name: "Aptos", size: 10 };
  const preview = await wb.render({ sheetName: sheet.name, autoCrop: "all", scale: 0.7, format: "png" });
  const safe = sheet.name.replace(/[^A-Za-z0-9_-]/g, "_");
  await fs.writeFile(`${previewDir}/${safe}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const inspect = await wb.inspect({ kind: "table", range: "08_Dashboard!A1:F16", include: "values,formulas", tableMaxRows: 20, tableMaxCols: 8 });
console.log(inspect.ndjson);
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "formula errors" });
console.log(errors.ndjson);

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(`${outDir}/NeuroAtlasAgent_Annotation_Template_v1.xlsx`);
