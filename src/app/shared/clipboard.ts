/**
 * Clipboard utilities
 */

/**
 * Copy string to clipboard
 * @param text text to copy
 */
export function copyToClipboard(text: string): void {
  let selBox = document.createElement('textarea')
  selBox.style.position = 'fixed'
  selBox.style.left = '0'
  selBox.style.top = '0'
  selBox.style.opacity = '0'
  // Set the value of the textarea to be the share link with their referral code
  selBox.value = text
  document.body.appendChild(selBox)
  // Focus on the element text, select the text, and use a copy command
  selBox.focus()
  selBox.select()
  document.execCommand('copy')
  // Take this hidden element out of the DOM
  document.body.removeChild(selBox)
}
