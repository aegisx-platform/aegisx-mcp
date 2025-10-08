# Thai Fonts for PDF Generation

To enable Thai font support in PDF generation, please download and place the following font files in this directory.

## 🎯 Recommended Fonts

### THSarabun Font (Primary Choice)
**Best for:** Government documents, official reports, business documents

Download these files:
- `THSarabun.ttf` (Normal)
- `THSarabun-Bold.ttf` (Bold)
- `THSarabun-Italic.ttf` (Italic)
- `THSarabun-BoldItalic.ttf` (Bold + Italic)

**Download from:** https://github.com/cadsondemak/thsarabun

### Sarabun Font (Alternative)
**Best for:** Modern designs, web documents, presentations

Download these files:
- `Sarabun-Regular.ttf` (Normal)
- `Sarabun-Bold.ttf` (Bold)
- `Sarabun-Italic.ttf` (Italic)
- `Sarabun-BoldItalic.ttf` (Bold + Italic)

**Download from:** https://fonts.google.com/specimen/Sarabun

## 📋 Installation Steps

1. **Download the font files** from the links above
2. **Place them in this directory** (`/assets/fonts/`)
3. **Restart the application** to load the new fonts
4. **Verify installation** by checking the font status API: `GET /api/pdf-fonts/status`

## 🔧 Font File Structure

After installation, your directory should look like this:

```
assets/fonts/
├── README.md (this file)
├── THSarabun.ttf
├── THSarabun-Bold.ttf
├── THSarabun-Italic.ttf
├── THSarabun-BoldItalic.ttf
├── Sarabun-Regular.ttf
├── Sarabun-Bold.ttf
├── Sarabun-Italic.ttf
└── Sarabun-BoldItalic.ttf
```

## 🧪 Testing

After installation, you can test the fonts using the API:

```bash
# Check font status
curl -X GET http://localhost:3333/api/pdf-fonts/status

# Test specific font
curl -X POST http://localhost:3333/api/pdf-fonts/test \
  -H "Content-Type: application/json" \
  -d '{"fontFamily": "THSarabun", "text": "สวัสดี Hello 123"}'

# Get available fonts
curl -X GET http://localhost:3333/api/pdf-fonts/available
```

## 📊 Current Status

- **Directory created:** ✅
- **Thai fonts available:** ❌ (Please download fonts)
- **Fallback to system fonts:** ✅
- **API endpoints ready:** ✅

## 🎨 Font Usage Guidelines

### When to Use Each Font:

**THSarabun:**
- Official documents
- Government reports
- Legal documents
- Traditional business documents

**Sarabun:**
- Modern web documents
- Presentations
- Marketing materials
- Creative designs

**Helvetica (Fallback):**
- Mixed language documents
- When Thai fonts are not available
- Limited Thai character support

### Font Size Recommendations:

- **Title/Headers:** 18-24pt
- **Body Text:** 10-12pt
- **Small Text:** 8-9pt
- **Captions:** 7-8pt

### Line Height for Thai Text:
- Use 1.3-1.4 line height for better readability
- Thai characters need more vertical space than Latin characters

## 🚨 Troubleshooting

### Fonts Not Loading?
1. Check file permissions on font files
2. Verify font file names match exactly
3. Ensure font files are not corrupted
4. Restart the application after adding fonts

### Thai Text Not Displaying Correctly?
1. Verify you're using a Thai font (THSarabun or Sarabun)
2. Check that the font file includes Thai character support
3. Use UTF-8 encoding for Thai text

### Performance Issues?
1. Font files should be under 2MB each
2. Only load fonts you actually use
3. Consider font subsetting for production

## 📞 Support

For font-related issues:
1. Check the font status API for diagnostics
2. Review application logs for font loading errors
3. Test individual fonts using the test API
4. Refer to the font recommendations API for guidance

## 📝 License Notes

- **THSarabun:** Open source, free for commercial use
- **Sarabun:** Google Fonts, SIL Open Font License
- Ensure compliance with font licenses in your use case