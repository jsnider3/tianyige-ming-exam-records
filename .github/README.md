# Tianyige Ming Examination Records — full text and English translation
# 天一閣藏明代科舉錄：全文錄文及英譯

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23817594.svg)](https://doi.org/10.5281/zenodo.23817594)

[English](#english) · [中文](#中文)

## English

**Browse online:** [joshuasnider.com/tianyige-ming-exam-records](https://www.joshuasnider.com/tianyige-ming-exam-records/) · **Hugging Face:** [jsnider3/tianyige-ming-exam-records](https://huggingface.co/datasets/jsnider3/tianyige-ming-exam-records) · **GitHub:** [jsnider3/tianyige-ming-exam-records](https://github.com/jsnider3/tianyige-ming-exam-records) · **Zenodo:** [10.5281/zenodo.23817594](https://doi.org/10.5281/zenodo.23817594)

Machine-read full text of **312 printed examination records** (科舉錄) from the Ming dynasty civil-service examinations, digitized by the **Tianyi Pavilion Museum** (天一閣博物院, Ningbo). It covers **40,461 page images**, about **9.9 million characters**, from **1371 to 1684**. Every page with text also has machine-added punctuation and an **English translation**. Each record is also split into its logical documents: prefaces, lists of officials, questions, graduates, and model answers with the examiners' comments. Tables list all **12,921 questions** and **49,378 graduates**.

The Tianyi Pavilion holds the largest surviving collection of Ming examination records. Each record is the official publication of one examination session:

| Type | Records | Pages | What a record contains |
|---|---|---|---|
| 鄉試錄 provincial examination records | 236 | 31,634 | examiners, all questions of the three sessions, the list of successful candidates, and model answers (程文) selected by the examiners, usually with the examiners' comments (批語) |
| 會試錄 metropolitan examination records | 37 | 4,200 | the same, for the national examination in the capital |
| 進士登科錄 palace examination records | 39 | 4,627 | the emperor's policy question (策問), the top three answers, and a biographical roster of every *jinshi* graduate (native place, household registration, classic studied, ancestors, rank) |

The set includes 7 military provincial examination records (武舉鄉試錄) and one Qing record (康熙二十三年四川鄉試錄, 1684). About 8,700 pages contain examiners' comments.

### Files

- `pages/<tianyige_id>.jsonl`: one file per record, one JSON line per page image (fields below).
- `documents/<tianyige_id>.jsonl`: the same record split into logical documents, one JSON line each (fields below).
- `questions.tsv`: every examination question in the collection, with year, record, level, province, session, subject and number.
- `graduates.tsv`: every graduate listed in the collection, with year, record, level, province, tier, rank, name and the full entry as printed (native place, school, classic studied; for palace rosters also family and earlier ranks).
- `volumes.tsv`: one row per record, with title, reign era and year, Western year, examination level, province, edition notes, page count, Wikimedia Commons link and SHA-1 of the source PDF. `volumes.json` holds the same metadata plus per-record page counts, for the viewer.
- `tables/`: the questions, graduates and volumes tables again, as JSON Lines with typed fields. The Hugging Face loader and viewer use these copies.
- `text/`: one plain-text file per record, named `<year>_<title>_<tianyige_id>.txt`, with page markers. This is the easiest way to read a record in a text editor.
- `index.html` and `assets/`: a browser for the dataset. It lists the records with filters. Each record can be viewed page by page, with the transcription (optionally in vertical columns, as printed), punctuated text, English translation and a link to the scan. It can also be viewed as documents: questions, model answers with the examiners' comments, and graduates. To use it locally, run `python3 -m http.server 8000` in this folder and open http://localhost:8000. Opening `index.html` directly from disk won't work, because browsers block it from loading the data files.

### Loading with Python

```python
from datasets import load_dataset

repo = "jsnider3/tianyige-ming-exam-records"
pages = load_dataset(repo, "pages", split="train")          # 40,461 pages: text, punctuation, translation
docs = load_dataset(repo, "documents", split="train")       # 81,298 documents
answers = docs.filter(lambda d: d["type"] == "model_answer")  # 7,348 model answers with comments
questions = load_dataset(repo, "questions", split="train")  # 12,921 questions
graduates = load_dataset(repo, "graduates", split="train")  # 49,378 graduates
```

The files are plain JSON Lines and TSV, so they can also be read without the `datasets` library.

### Page fields

| Field | Meaning |
|---|---|
| `id` | `<tianyige_id>_p<page>` |
| `tianyige_id`, `title`, `western_year`, `reign_era`, `reign_year`, `exam_level`, `military`, `province`, `province_en` | record metadata |
| `page` | page number in the source PDF (each page image is one opening: two facing half-leaves) |
| `scan_url` | the exact page on Wikimedia Commons, for checking the transcription against the scan |
| `text` | the transcription (conventions below) |
| `banxin` | text of the printed block-center strip (版心), usually the section name and leaf number |
| `ocr_model` | the model that produced `text` |
| `alt_text`, `alt_ocr_model`, `agreement` | for the 12,600 pages read by two different models: the second reading, and character-level agreement between the two (0 to 1, after traditional-to-simplified normalization) |
| `blank`, `has_examiner_comments`, `chatter_stripped` | flags (`chatter_stripped`: non-transcription model commentary was removed from this page) |
| `punctuated` | the transcription with modern Chinese punctuation added (null for blank pages) |
| `translation_en` | English translation of the page (null for blank pages) |
| `translation_model` | the model that produced `punctuated` and `translation_en` |

### Document fields

| Field | Meaning |
|---|---|
| `id` | `<tianyige_id>_d<n>`, in reading order |
| `type` | `title`, `heading`, `preface`, `postface`, `edict`, `officials`, `procedure`, `question`, `graduate_entry`, `model_answer` or `other` |
| `text` | the document's transcription, joined across columns and pages (for model answers, the essay itself) |
| `start`, `end`, `pages`, `scan_url` | where it is: first and last line as `page.line`, the pages it spans, and the scan of its first page |
| `session`, `subject`, `number` | for questions and model answers: examination session (1–3), subject (四書, 易, 書, 詩, 春秋, 禮記, 論, 詔, 誥, 表, 判, 策) and number within the subject |
| `header`, `candidate`, `rank`, `comments`, `question_id` | for model answers: the restated topic, the candidate and his rank, the examiners' comments (each with `role`, `name`, `office`, `text`), and the `id` of the question it answers |
| `name`, `rank`, `label` | for graduate entries: name, rank, and tier (e.g. 第二甲) |
| `label` | for headings, prefaces and postfaces: the heading text or author |

### Transcription conventions

- One line per printed column, read top to bottom and right to left. The right half-leaf comes first. A line `===` separates the two half-leaves.
- `〔…〕` marks small double-line annotation (雙行小字); the right sub-column is transcribed before the left.
- `□` marks a character the model judged illegible or damaged.
- Honorific elevation (抬頭) starts a new line, as in the print.
- No punctuation has been added. Characters are meant to be kept as printed (traditional and variant forms), but see the caveats below.

### How it was made

Each PDF page was rendered at 150 dpi, scaled to at most 2576 px and 3.75 megapixels, and transcribed by a vision-language model with a fixed prompt. Two models were used:

- **gemini-4-argon** (Google, via the Antigravity CLI, low effort) for about 29,200 pages.
- **Claude Opus 5.5** (Anthropic, low effort) for about 11,200 pages.

About 12,600 pages were read by both. Where a Gemini reading exists it is the primary `text`, and the Claude reading is kept in `alt_text`. Pages whose every reading had a problem (model commentary, output loops, truncated output) were re-read with gemini-4-argon at medium effort.

**Punctuation and translation.** Each of the 38,711 non-blank pages was punctuated and translated into English in one pass. Two models did the work, and the `translation_model` field records which:

- **gpt-6-astra** (OpenAI, via the Codex CLI, medium effort): 27,910 pages.
- **gemini-4-argon** (via the Antigravity CLI): 10,801 pages.

The model sees the end of the previous page and the start of the next as context, so sentences that cross page breaks are translated correctly. Each translation still covers only its own page, and marks a sentence cut at the page edge with "…". Official titles follow Charles Hucker's *A Dictionary of Official Titles in Imperial China*. Personal and place names are given in pinyin, often with the characters. Doubtful readings are marked `[?]`, and bracketed notes sometimes suggest a correction to a likely OCR error. Occasionally a Chinese character slips into the English text.

Every punctuated page was checked against its transcription. On 98.9% of pages the characters match exactly. On most of the rest, the punctuated text moves a line into logical reading order (for example, a candidate's name printed in a separate column) or silently corrects an apparent OCR error. Outputs that came back truncated or empty (84 pages) were redone.

**Splitting into documents.** Every printed column was given an ID (`page.line`). Records were shown to a language model in windows of about 30 pages, each with the tail of the previous window as context. gemini-4-argon (via the Antigravity CLI) handled 955 of the 1,467 windows and gpt-6-astra (via the Codex CLI) the other 512; each document records which. The model returned only the ID where each document begins, with its type and fields; it never rewrote any text. The documents were then cut from the transcription at those points, so every line belongs to exactly one document, which was checked for all 312 records. Each model answer's topic line, examiners' comments and essay are grouped into one document and linked to the question it answers, by subject and number or, failing that, by matching the restated topic.

The result has 12,921 questions, 7,348 model answers and 49,378 graduate entries. 95.5% of the model answers carry examiners' comments, and 83% are linked to their question. A typical provincial record splits into the regular Ming pattern: three Four Books topics, four topics for each classic, a discourse, three documents, five judgments, five policy questions, then twenty-odd model answers.

### Quality

- **Benchmark against human transcriptions.** Before the full run, eight models were compared against volunteer transcriptions on Chinese Wikisource for six pages, three dense rosters and three essay pages with a watermark. gemini-4-argon scored a 2.4% character error rate and Claude Opus 5.5 2.3% (3.0% at the low effort used for the bulk run). Most of the remaining differences were variant character forms, or errors in the reference transcription itself, not misreadings. The real error rate on essay text is estimated at around 1%.
- **Agreement between the two models:** median 98.1% on the 12,600 dual-read pages. About 800 pages agree below 90%; check those against the scan.
- **Known weak spots:**
  - Prefaces carved in a calligraphic, semi-cursive hand (寫刻).
  - The small semi-cursive script of examiners' comments.
  - Rare characters in personal and place names.
  - Reading order inside multi-column small text.
- **Variant forms.** The models sometimes modernize variant forms despite instructions (e.g. 扵 → 於, 氷 → 冰). Do not rely on this text for orthographic or paleographic study without checking the scan.
- **Document boundaries are machine-made.** Occasionally a boundary falls a column early or late, or two short items are merged. About 17% of model answers aren't linked to a question, usually because the record's question pages are missing or the topic isn't restated. 84 graduate entries have no name extracted. The punctuation and translation are still page-level, so read them from `pages/`.
- **Translations are machine output too,** and inherit any OCR errors on the page. Treat them as a reading aid, not a scholarly translation.

This is uncorrected machine output. For citation or close reading, always check against `scan_url`.

### Sources and credit

The scans were digitized by the **Tianyi Pavilion Museum** (天一閣博物院) and uploaded to Wikimedia Commons in March 2025 ("Books in Tianyi Pavilion Museum"), credited to the museum and marked public domain (PD-old-100-expired). This dataset covers the Commons files titled 會試錄, 鄉試錄 and 登科錄. Military examination records (武舉錄), alumni registers (同年錄) and miscellaneous items in the same upload are not included.

### License

The transcriptions and metadata are released under **CC0 1.0** (public domain dedication). The underlying scans are public domain.

### Citation

Compiled by Joshua Snider ([ORCID 0009-0004-2574-250X](https://orcid.org/0009-0004-2574-250X)). Archived on Zenodo: [10.5281/zenodo.23817594](https://doi.org/10.5281/zenodo.23817594) always resolves to the latest version. The first release is [10.5281/zenodo.23817595](https://doi.org/10.5281/zenodo.23817595).

```
@dataset{tianyige_ming_exam_ocr,
  title     = {Tianyige Ming Examination Records: Full Text and English Translation},
  author    = {Snider, Joshua},
  year      = {2026},
  publisher = {Zenodo},
  doi       = {10.5281/zenodo.23817594},
  url       = {https://doi.org/10.5281/zenodo.23817594},
  note      = {Machine transcription, punctuation and English translation of 312 Ming examination records digitized by the Tianyi Pavilion Museum}
}
```

## 中文

**線上瀏覽**：[joshuasnider.com/tianyige-ming-exam-records](https://www.joshuasnider.com/tianyige-ming-exam-records/) · **Hugging Face**：[jsnider3/tianyige-ming-exam-records](https://huggingface.co/datasets/jsnider3/tianyige-ming-exam-records) · **GitHub**：[jsnider3/tianyige-ming-exam-records](https://github.com/jsnider3/tianyige-ming-exam-records) · **Zenodo**：[10.5281/zenodo.23817594](https://doi.org/10.5281/zenodo.23817594)

本數據集收錄**天一閣博物院**（寧波）數字化之明代科舉錄**312種**的機器識讀全文，共**40,461頁**影像，約**990萬字**，時間跨度為**1371至1684年**。凡有文字之頁，均附機器標點及**英文翻譯**。各錄另按篇切分為序、官員名錄、試題、中式名錄，以及附考官批語的程文。另編有**試題總表（12,921道）**及**中式者總表（49,378人）**。

天一閣所藏明代科舉錄為現存最豐富者。每種科舉錄即一科考試的官方刊本：

| 類別 | 種數 | 頁數 | 內容 |
|---|---|---|---|
| 鄉試錄 | 236 | 31,634 | 考官名錄、三場全部試題、中式舉人名錄，以及考官所選程文，多附考官批語 |
| 會試錄 | 37 | 4,200 | 同上，為京師會試 |
| 進士登科錄 | 39 | 4,627 | 殿試策問、一甲三名對策，以及全部進士的履歷名錄（籍貫、戶籍、本經、祖上三代、名次） |

另含武舉鄉試錄7種及清康熙二十三年四川鄉試錄1種。含考官批語者約8,700頁。

### 文件

- `pages/<天一閣編號>.jsonl`：每錄一個文件，每頁影像一行JSON（字段見下）。
- `documents/<天一閣編號>.jsonl`：同一錄按篇切分，每篇一行JSON（字段見下）。
- `questions.tsv`：全部試題，含年份、所屬科舉錄、考試級別、省份、場次、科目及序號。
- `graduates.tsv`：全部中式者，含年份、所屬科舉錄、考試級別、省份、甲第、名次、姓名及原文（籍貫、學校、本經；登科錄另有家世及歷次名次）。
- `volumes.tsv`：每錄一行，含書名、年號及年次、公元年、考試級別、省份、版本、頁數、維基共享資源鏈接及原PDF的SHA-1值。`volumes.json` 為同一元數據另加各錄頁數統計，供瀏覽界面使用。
- `tables/`：上述試題、中式者及各錄元數據表格的 JSON Lines 版本，字段類型明確，供 Hugging Face 讀取及預覽。
- `text/`：每錄一個純文本文件，文件名為 `<年份>_<書名>_<天一閣編號>.txt`，附頁碼標記，最便於以文本編輯器閱讀。
- `index.html` 與 `assets/`：數據集瀏覽界面。可按條件篩選各錄。每錄可逐頁閱讀，對照錄文（可切換為與原書相同的直排）、標點文本、英譯及原圖鏈接；亦可按篇閱讀試題、附考官批語的程文及中式名錄。本地使用時，在此目錄運行 `python3 -m http.server 8000`，再打開 http://localhost:8000。直接打開 `index.html` 無法使用，因瀏覽器會阻止其讀取數據文件。

### 以 Python 讀取

```python
from datasets import load_dataset

repo = "jsnider3/tianyige-ming-exam-records"
pages = load_dataset(repo, "pages", split="train")          # 40,461頁：錄文、標點、英譯
docs = load_dataset(repo, "documents", split="train")       # 81,298篇
answers = docs.filter(lambda d: d["type"] == "model_answer")  # 7,348篇程文，附考官批語
questions = load_dataset(repo, "questions", split="train")  # 12,921道試題
graduates = load_dataset(repo, "graduates", split="train")  # 49,378名中式者
```

各文件均為普通的 JSON Lines 及 TSV 格式，不用 `datasets` 庫亦可直接讀取。

### 頁面字段

| 字段 | 含義 |
|---|---|
| `id` | `<天一閣編號>_p<頁碼>` |
| `tianyige_id`、`title`、`western_year`、`reign_era`、`reign_year`、`exam_level`、`military`、`province`、`province_en` | 所屬科舉錄的元數據 |
| `page` | 原PDF頁碼（每頁影像為一個展開頁，即左右兩個半葉） |
| `scan_url` | 該頁在維基共享資源上的位置，供以原圖核對錄文 |
| `text` | 錄文（體例見下） |
| `banxin` | 版心文字，通常為篇名及葉碼 |
| `ocr_model` | 生成 `text` 的模型 |
| `alt_text`、`alt_ocr_model`、`agreement` | 約12,600頁經兩種模型分別識讀：另一模型的錄文，及兩者的字符一致率（0至1，經繁簡歸一後計算） |
| `blank`、`has_examiner_comments`、`chatter_stripped` | 標記（`chatter_stripped` 表示已刪除該頁中模型附加的非錄文說明） |
| `punctuated` | 加現代標點的錄文（空白頁為 null） |
| `translation_en` | 該頁的英譯（空白頁為 null） |
| `translation_model` | 生成 `punctuated` 及 `translation_en` 的模型 |

### 篇章字段

| 字段 | 含義 |
|---|---|
| `id` | `<天一閣編號>_d<序號>`，按閱讀順序 |
| `type` | `title`（題名）、`heading`（標題）、`preface`（序）、`postface`（後序）、`edict`（詔諭）、`officials`（官員名錄）、`procedure`（儀注規制）、`question`（試題）、`graduate_entry`（中式者）、`model_answer`（程文）或 `other`（其他） |
| `text` | 該篇錄文，跨行跨頁連接（程文則為文章正文） |
| `start`、`end`、`pages`、`scan_url` | 位置：首行及末行（`頁.行`）、所跨頁碼、首頁原圖 |
| `session`、`subject`、`number` | 試題及程文：場次（1至3）、科目（四書、易、書、詩、春秋、禮記、論、詔、誥、表、判、策）及該科序號 |
| `header`、`candidate`、`rank`、`comments`、`question_id` | 程文：所復述的題目、作者及其名次、考官批語（各含職銜 `role`、姓名 `name`、官職 `office`、批語 `text`），以及所答試題的 `id` |
| `name`、`rank`、`label` | 中式者：姓名、名次及甲第（如第二甲） |
| `label` | 標題、序、後序：標題文字或作者 |

### 錄文體例

- 每行對應原書一行，自上而下、自右而左。先右半葉，後左半葉，中間以 `===` 一行分隔。
- `〔…〕` 為雙行小字，先錄右行，後錄左行。
- `□` 為模型判斷漫漶難辨之字。
- 抬頭處另起一行，與原書一致。
- 錄文未加標點。原則上保留原書字形（繁體及異體），但請參看下文的局限說明。

### 製作方法

每頁PDF以150 dpi渲染，縮至長邊不超過2576像素、總像素不超過375萬，再以固定提示詞交由視覺語言模型識讀。共使用兩種模型：

- **gemini-4-argon**（Google，經 Antigravity CLI，低推理強度）：約29,200頁。
- **Claude Opus 5.5**（Anthropic，低推理強度）：約11,200頁。

約12,600頁經兩種模型分別識讀。凡有 Gemini 錄文者，以之為主錄文 `text`，Claude 錄文則存於 `alt_text`。凡各次識讀均有問題的頁面（混入模型說明、輸出循環、輸出截斷），以 gemini-4-argon 中等推理強度重新識讀。

**標點與翻譯。** 38,711個非空白頁均一次完成標點及英譯，由兩種模型分擔，`translation_model` 字段記錄所用模型：

- **gpt-6-astra**（OpenAI，經 Codex CLI，中等推理強度）：27,910頁。
- **gemini-4-argon**（經 Antigravity CLI）：10,801頁。

模型同時看到上一頁末尾及下一頁開頭作為上下文，故跨頁的句子得以正確翻譯；但每條譯文只涵蓋本頁，在頁邊斷開處以「…」標示。官名英譯依照賀凱（Charles Hucker）《中國古代官名辭典》（*A Dictionary of Official Titles in Imperial China*）。人名地名用拼音，多附漢字。存疑處標 `[?]`，方括號中的注文有時提示可能的識讀錯誤。英譯中偶有漢字混入。

全部標點文本均已與錄文比對：98.9%的頁面用字完全一致；其餘多為將某行調至合乎閱讀的順序（如另行刊印的考生姓名），或逕改明顯的識讀錯誤。輸出截斷或為空者（84頁）已重做。

**分篇。** 原書每一行均賦予編號（`頁.行`）。各錄以約30頁為一段交由語言模型處理，每段並附上一段的末尾作為上下文。1,467段中，955段由 gemini-4-argon（經 Antigravity CLI）處理，512段由 gpt-6-astra（經 Codex CLI）處理，各篇均記錄所用模型。模型只返回每篇起始行的編號及其類型與字段，從不改寫文字；程序再據此從錄文中切分，故每一行恰屬一篇，312種全部經過此項檢查。每篇程文的題目行、考官批語及正文合為一篇，並按科目及序號對應到所答試題；無法如此對應時，則比對程文所復述的題目。

結果共得試題12,921道、程文7,348篇、中式者49,378人。程文中95.5%附有考官批語，83%已對應到試題。典型的鄉試錄切分後呈現明代常規格局：四書題三道，每經四道，論一道，詔誥表三道，判五道，策五道，其後為程文二十餘篇。

### 質量

- **與人工錄文比對。** 全面識讀之前，以中文維基文庫的志願者錄文為參照，比較了八種模型在六頁上的表現，其中三頁為密排名錄，三頁為帶水印的文章。gemini-4-argon 的字符錯誤率為2.4%，Claude Opus 5.5 為2.3%（批量識讀所用的低推理強度下為3.0%）。剩餘差異大多為異體字，或參照錄文本身的錯誤，而非誤識。正文的實際錯誤率估計約為1%。
- **兩模型互校：** 在約12,600個雙重識讀頁上，中位一致率為98.1%。約800頁的一致率低於90%，宜以原圖核對。
- **已知薄弱處：**
  - 以行草書體上版的寫刻序文。
  - 考官批語的行草小字。
  - 人名地名中的僻字。
  - 多行小字內部的閱讀順序。
- **異體字。** 模型雖受指示，仍偶將異體字改為通行字（如扵→於、氷→冰）。作文字學或版本學研究時，請勿未核原圖即依據此錄文。
- **篇界為機器標定。** 偶有篇界前後差一行，或兩短篇合為一篇。約17%的程文未能對應到試題，多因該錄缺試題頁，或程文未復述題目。有84名中式者未能提取姓名。標點及英譯仍以頁為單位，請從 `pages/` 中閱讀。
- **英譯亦為機器輸出，** 且沿襲該頁的識讀錯誤，僅供閱讀參考，並非學術譯本。

本數據集為未經人工校對的機器輸出。引用或細讀時，請務必以 `scan_url` 核對原圖。

### 來源與致謝

影像由**天一閣博物院**數字化，2025年3月上傳至維基共享資源（"Books in Tianyi Pavilion Museum"），署名天一閣博物院，標為公有領域（PD-old-100-expired）。本數據集涵蓋其中題為會試錄、鄉試錄及登科錄的文件；同批上傳的武舉錄、同年錄及其他雜項未收入。

### 許可

錄文及元數據以 **CC0 1.0**（公有領域貢獻）釋出。原圖本身屬公有領域。

### 引用

編者：Joshua Snider（[ORCID 0009-0004-2574-250X](https://orcid.org/0009-0004-2574-250X)）。存檔於 Zenodo：[10.5281/zenodo.23817594](https://doi.org/10.5281/zenodo.23817594) 始終指向最新版本，首次發布的版本為 [10.5281/zenodo.23817595](https://doi.org/10.5281/zenodo.23817595)。

```
@dataset{tianyige_ming_exam_ocr,
  title     = {Tianyige Ming Examination Records: Full Text and English Translation},
  author    = {Snider, Joshua},
  year      = {2026},
  publisher = {Zenodo},
  doi       = {10.5281/zenodo.23817594},
  url       = {https://doi.org/10.5281/zenodo.23817594},
  note      = {Machine transcription, punctuation and English translation of 312 Ming examination records digitized by the Tianyi Pavilion Museum}
}
```
