---
license: cc0-1.0
language:
- lzh
- zh
pretty_name: Tianyige Ming Examination Records (OCR)
tags:
- classical-chinese
- ming-dynasty
- civil-service-examination
- keju
- ocr
- digital-humanities
size_categories:
- 10K<n<100K
---

# Tianyige Ming Examination Records — full-text OCR
# 天一閣藏明代科舉錄 全文OCR

**English** · [中文](#中文說明)

Machine-read full text of **312 printed examination records** (科舉錄) from the Ming dynasty civil-service examinations, digitized by the **Tianyi Pavilion Museum** (天一閣博物院, Ningbo). It covers **40,461 page images**, about **9.9 million characters**, from **1371 to 1684**.

The Tianyi Pavilion holds the largest surviving collection of Ming examination records. Each record is the official publication of one examination session:

| Type | Records | Pages | What a record contains |
|---|---|---|---|
| 鄉試錄 provincial examination records | 236 | 31,634 | examiners, all questions of the three sessions, the list of successful candidates, and model answers (程文) selected by the examiners, usually with the examiners' comments (批語) |
| 會試錄 metropolitan examination records | 37 | 4,200 | the same, for the national examination in the capital |
| 進士登科錄 palace examination records | 39 | 4,627 | the emperor's policy question (策問), the top three answers, and a biographical roster of every *jinshi* graduate (native place, household registration, classic studied, ancestors, rank) |

The set includes 7 military provincial examination records (武舉鄉試錄) and one Qing record (康熙二十三年四川鄉試錄, 1684). About 8,700 pages contain examiners' comments.

## Files

- `pages/<tianyige_id>.jsonl`: one file per record, one JSON line per page image (fields below).
- `volumes.tsv`: one row per record, with title, reign era and year, Western year, examination level, province, edition notes, page count, Wikimedia Commons link and SHA-1 of the source PDF. `volumes.json` holds the same metadata plus translation progress, for the viewer.
- `text/`: one plain-text file per record, named `<year>_<title>_<tianyige_id>.txt`, with page markers. This is the easiest way to read a record in a text editor.
- `index.html` and `assets/`: a browser for the dataset. It lists the records with filters, and shows each record page by page: transcription (optionally in vertical columns, as printed), punctuated text, English translation and a link to the scan. To use it locally, run `python3 -m http.server 8000` in this folder and open http://localhost:8000. Opening `index.html` directly from disk won't work, because browsers block it from loading the data files.

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
| `punctuated` | the transcription with modern Chinese punctuation added, characters unchanged (null if not yet processed) |
| `translation_en` | English translation of the page (null if not yet translated) |
| `translation_model` | the model that produced `punctuated` and `translation_en` |

### Transcription conventions

- One line per printed column, read top to bottom and right to left. The right half-leaf comes first. A line `===` separates the two half-leaves.
- `〔…〕` marks small double-line annotation (雙行小字); the right sub-column is transcribed before the left.
- `□` marks a character the model judged illegible or damaged.
- Honorific elevation (抬頭) starts a new line, as in the print.
- No punctuation has been added. Characters are meant to be kept as printed (traditional and variant forms), but see the caveats below.

## How it was made

Each PDF page was rendered at 150 dpi, scaled to at most 2576 px and 3.75 megapixels, and transcribed by a vision-language model with a fixed prompt. Two models were used:

- **gemini-4-argon** (Google, via the Antigravity CLI, low effort) for about 29,200 pages.
- **Claude Opus 5.5** (Anthropic, low effort) for about 11,200 pages.

About 12,600 pages were read by both. Where a Gemini reading exists it is the primary `text`, and the Claude reading is kept in `alt_text`. Pages whose every reading had a problem (model commentary, output loops, truncated output) were re-read with gemini-4-argon at medium effort.

**Punctuation and translation (in progress).** Each non-blank page is punctuated and translated into English in one pass, mainly by gemini-4-argon (via the Antigravity CLI). When that quota runs out, gpt-6-astra (via the Codex CLI) takes over. The `translation_model` field records which. The model sees the end of the previous page and the start of the next as context, so sentences that cross page breaks are translated correctly. Each translation still covers only its own page, and marks a sentence cut at the page edge with "…". Official titles follow Charles Hucker's *A Dictionary of Official Titles in Imperial China*. Personal and place names are given in pinyin, often with the characters. Doubtful readings are marked `[?]`, and bracketed notes sometimes suggest a correction to a likely OCR error. The punctuated text was checked to keep the transcription's characters unchanged. Occasionally a Chinese character slips into the English text.

## Quality

- **Benchmark against human transcriptions.** Before the full run, eight models were compared against volunteer transcriptions on Chinese Wikisource for six pages, three dense rosters and three essay pages with a watermark. gemini-4-argon scored a 2.4% character error rate and Claude Opus 5.5 2.3% (3.0% at the low effort used for the bulk run). Most of the remaining differences were variant character forms, or errors in the reference transcription itself, not misreadings. The real error rate on essay text is estimated at around 1%.
- **Agreement between the two models:** median 98.1% on the 12,600 dual-read pages. About 800 pages agree below 90%; check those against the scan.
- **Known weak spots:**
  - Prefaces carved in a calligraphic, semi-cursive hand (寫刻).
  - The small semi-cursive script of examiners' comments.
  - Rare characters in personal and place names.
  - Reading order inside multi-column small text.
- **Variant forms.** The models sometimes modernize variant forms despite instructions (e.g. 扵 → 於, 氷 → 冰). Do not rely on this text for orthographic or paleographic study without checking the scan.
- **Page level only.** Essays and rosters run across page breaks. The text has not yet been segmented into documents (preface, question, model answer, comment, roster entry).
- **Translations are machine output too,** and inherit any OCR errors on the page. Treat them as a reading aid, not a scholarly translation.

This is uncorrected machine output. For citation or close reading, always check against `scan_url`.

## Sources and credit

The scans were digitized by the **Tianyi Pavilion Museum** (天一閣博物院) and uploaded to Wikimedia Commons in March 2025 ("Books in Tianyi Pavilion Museum"), credited to the museum and marked public domain (PD-old-100-expired). This dataset covers the Commons files titled 會試錄, 鄉試錄 and 登科錄. Military examination records (武舉錄), alumni registers (同年錄) and miscellaneous items in the same upload are not included.

## License

The transcriptions and metadata are released under **CC0 1.0** (public domain dedication). The underlying scans are public domain.

## Citation

```
@dataset{tianyige_ming_exam_ocr,
  title  = {Tianyige Ming Examination Records: Full-Text OCR},
  author = {Snider, Joshua},
  year   = {2026},
  note   = {Machine transcription of 312 Ming examination records digitized by the Tianyi Pavilion Museum},
  url    = {<url>}
}
```

---

## 中文說明

本數據集為**天一閣博物院**所藏明代科舉錄的機器識讀全文。共收**312種**，**40,461頁**影像，約**990萬字**，時間跨度為**1371至1684年**。其中鄉試錄236種、會試錄37種、進士登科錄39種，另含武舉鄉試錄7種及清康熙二十三年四川鄉試錄1種。

各錄載有考官名錄、三場試題、中式名錄，以及考官所選程文及批語（鄉試錄、會試錄），或殿試策問、一甲三名對策及進士履歷（登科錄）。含考官批語者約8,700頁。

**文件**
- `pages/<天一閣編號>.jsonl`：每錄一個文件，逐頁記錄，含原圖鏈接 `scan_url`、識讀文本、版心文字，以及陸續加入的標點文本 `punctuated` 與英譯 `translation_en`。
- `index.html`：瀏覽界面，可逐頁對照錄文（可切換為直排）、標點文本、英譯與原圖。本地使用時，在此目錄運行 `python3 -m http.server 8000`，再打開 http://localhost:8000 。
- `volumes.tsv`：各錄元數據（年號、公元年、考試級別、省份、版本等）。
- `text/`：每錄一個純文本文件，便於閱讀。

**錄文體例**：每行對應原書一行，自上而下、自右而左；`===` 分隔左右半葉；`〔…〕` 為雙行小字；`□` 為漫漶難辨之字；抬頭另起一行；未加標點。

**製作方法與質量**：原圖以視覺語言模型識讀，主要使用 gemini-4-argon（約29,200頁）與 Claude Opus 5.5（約11,200頁），其中約12,600頁經兩種模型分別識讀，以供互校。與維基文庫人工錄文比對，字符錯誤率約為2.3%至2.4%，其中大部分為異體字或參照錄文本身的差異，正文實際錯誤率估計約為1%。兩模型互校的中位一致率為98.1%。

**已知局限**：寫刻體序文、考官批語之行草小字、人名地名中的僻字，識讀較弱；模型偶將異體字改為通行字（如扵→於）；文本按頁切分，尚未分篇。標點與英譯正在進行中，亦為機器輸出，且沿襲錄文中的識讀錯誤，僅供閱讀參考。此為未經人工校對的機器錄文，引用時請以原圖核對。

**來源**：影像由天一閣博物院數字化，2025年3月上傳至維基共享資源，標為公有領域。

**許可**：錄文及元數據以 **CC0 1.0** 釋出。
