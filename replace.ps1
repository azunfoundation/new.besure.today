$files = Get-ChildItem -Path "c:\new besure today" -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    $content = $content -replace "2180 W State Rd 434, Suite 6112, Longwood, FL 32779", "St Petersburg Florida - 33701"
    $content = $content -replace "Srinivas Nagar Colony, Ameerpet, Hyderabad, Telangana 500016", "Bowenpally, Hyderabad - 500011"
    
    $content = $content -replace "Est\. 2019", "Est. 2024"
    
    $content = $content -replace "5\+</span>\s*<span class=`"about-preview__badge-text`">Years of Excellence", "2+</span>`n              <span class=`"about-preview__badge-text`">Years of Excellence"
    
    $content = $content -replace "15\+\s*businesses", "21+ businesses"
    
    $content = $content -replace "contact@besure\.today", "besure.today@gmail.com"
    
    $content = $content -replace "\+91 96180 89555", "+91 9177958777"
    $content = $content -replace "\+91-96180-89555", "+91-917795-8777"
    $content = $content -replace "tel:\+919618089555", "tel:+919177958777"
    
    # Hide US Number HTML sections safely
    $content = $content -replace "<a href=`"tel:\+19046993086`" style=`"color:var\(--text-inverse-muted\)`">\+1 \(904\) 699-3086</a><br>", ""
    $content = $content -replace "<div class=`"mobile-menu__contact-item`"><i class=`"fa-solid fa-phone`"></i><a href=`"tel:\+19046993086`">\+1 \(904\) 699-3086</a></div>", ""
    $content = $content -replace "<a href=`"tel:\+19046993086`">\+1 \(904\) 699-3086</a><br>", ""
    $content = $content -replace "`"\+1-904-699-3086`",", ""
    $content = $content -replace "tel:\+19046993086", "tel:+919177958777" # Fallback if only link left

    # Instagram
    $content = $content -replace "https://www\.instagram\.com/besloyal", "https://www.instagram.com/besure.today?igsh=MWQwZHJhaGhodnNhNw=="
    
    # Map
    $content = $content -replace "https://www\.google\.com/maps/embed\?pb=[^`"]+", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.8070678036214!2d78.4684!3d17.4699!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9046537604f5%3A0x6ec040f7f2b1d3d!2sBowenpally%2C%20Hyderabad%2C%20Telangana%20500011!5e0!3m2!1sen!2sin!4v1"
    $content = $content -replace "BeSURE US Office Location", "BeSURE India Office Location"

    # From Telangana India to Florida USA In our story
    $content = $content -replace "Building businesses that last, from Florida to Telangana", "From Telangana India to Florida USA In our story"
    
    Set-Content $file.FullName -Value $content
}
