$files = Get-ChildItem -Path "c:\new besure today" -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Remove section--dark and add process-stats--light
    $content = $content -replace 'class="section section--dark process-stats"', 'class="section process-stats process-stats--light"'

    # Remove inline color styles from h2 and section-label in process-stats sections
    # To be safe, we will just globally remove style="color: var(--text-inverse);" from <h2> since h2s usually don't need it outside dark sections anyway
    $content = $content -replace 'style="color: var\(--text-inverse\);"', ''
    
    # And for section-label inline styles (gold-light and sapphire-light)
    $content = $content -replace 'style="color: var\(--accent-gold-light\);"', ''
    $content = $content -replace 'style="color: var\(--accent-sapphire-light\);"', ''

    Set-Content $file.FullName -Value $content
}
