# ADR-005: Use pdfcpu via CLI Instead of Library

## Status
**Accepted** (Dec 6, 2025)

## Context
Need to extract text from PDF files in resource folders. Options:
1. pdfcpu Go library (direct API calls)
2. pdfcpu CLI via exec.Command
3. Alternative library (pdftotext, etc.)

## Decision
**Use `exec.Command` to call pdfcpu CLI binary** instead of the Go library.

## Rationale
- **Library API mismatch**: pdfcpu Go API doesn't match documentation
- **CLI is stable**: Command-line interface is well-documented and works
- **Maintenance**: CLI updates without code changes
- **Fallback**: If CLI fails, can shell out to other tools

## Implementation
```go
func ExtractPDFText(path string) (string, error) {
    cmd := exec.Command("pdfcpu", "content", "extract", "-p", "all", path)
    output, err := cmd.Output()
    if err != nil {
        return "", fmt.Errorf("pdfcpu extract failed: %w", err)
    }
    return string(output), nil
}
```

## Consequences

### Positive
- Works immediately with stable API
- Can swap to different tool easily
- No library version conflicts

### Negative
- Requires pdfcpu binary installed
- Subprocess overhead (~10ms per PDF)
- Error messages less structured

## Alternatives Considered
- **pdftotext**: Unix-only, less cross-platform
- **pdf.js**: JavaScript, would need Node runtime
- **Apache PDFBox**: Java, heavy dependency



