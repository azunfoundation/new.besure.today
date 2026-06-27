$files = Get-ChildItem -Path "c:\new besure today" -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # 1. Remove the line with +1 (904) 699-3086 that also has a <br> (this is the one in the footer)
    $content = $content -replace "(?m)^\s*<a href=`"tel:\+919177958777`" style=`"color: var\(--text-inverse-muted\);`">\+1 \(904\) 699-3086</a><br>\r?\n", ""

    # 2. Also remove it if it has no <br> but followed by the next India number line
    $content = $content -replace "(?m)^\s*<a href=`"tel:\+919177958777`" style=`"color: var\(--text-inverse-muted\);`">\+1 \(904\) 699-3086</a>\r?\n", ""
    
    # 3. Just replace all remaining literal "+1 (904) 699-3086" with "+91 9177958777"
    $content = $content -replace "\+1 \(904\) 699-3086", "+91 9177958777"
    
    Set-Content $file.FullName -Value $content
}
