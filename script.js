"use strict";

// Variables to track history of staggers, so that we can avoid excess non-random-SEEMING repeats.
var previousInputCaps = false;
var previousPreviousInputCaps = false;

// This % of the time, we'll allow the next character to have the same capitalization as the previous.
var percentageOfTimeToNotStagger = 0.2;


// Input changed.  Convert and replace it.
function newInput() {
	var textArea = document.getElementById('input-text-area');

	// Save user's current text cursor location.
	var oldCursorLocation = textArea.selectionEnd;

	// Convert user's input text's capitalization.
	textArea.value = translate(textArea.value);

	// Set user's typing location back to where it was.
	//   Otherwise it'll be at the end of the text after each keystroke, because we replace all of it.
	textArea.selectionEnd = oldCursorLocation;

	// Rotate the background image a bit,(but set it back to 0 rotation if the textarea is cleared)
	document.getElementById('background-image').style.transform = "translate(-50%, -50%) rotate(" + ((Math.random()*20)-10).toString() + "deg)";
	if (textArea.value == "")
		document.getElementById('background-image').style.transform = "translate(-50%, -50%)";
}


//  Stagger caps, every other, with a small degree of randomness allowing case upset
//    if the last two letters aren't the same capitalization already.
function translate(inputString) {
	// Lowercase the whole thing. We don't care about the original caps and we'd like a uniform initial state.
	inputString = inputString.toLowerCase();

	// We'll add chars to this output string one at a time.
	var outputString = "";

	// For each character in input string...
	for (var i=0; i<inputString.length; i++) {
		var currentChar = inputString[i];

		// If char isn't a caps-able letter, append it unaltered and leave the history trackers alone.
		if (currentChar.toUpperCase() == currentChar.toLowerCase())
		outputString += currentChar;

		// If previous 2 chars are both caps, add this one as lowercase.
		else if (previousInputCaps && previousPreviousInputCaps) {
			// Add char to output string.
			outputString += currentChar.toLowerCase();
			// Set history tracking variables.
			previousPreviousInputCaps = previousInputCaps;
			previousInputCaps = false;
		}
		// If previous 2 chars are both lowercase, add this one as caps.
		else if (!previousInputCaps && !previousPreviousInputCaps) {
			// Add char to output string.
			outputString += currentChar.toUpperCase();
			// Set history tracking variables.
			previousPreviousInputCaps = previousInputCaps;
			previousInputCaps = true;
		}

		// Roll to see if we stagger this letter's capitalization, relative to the last.
		//   No, append with same capitalization as last letter.
		else if (Math.random() < percentageOfTimeToNotStagger) {
			// Add char to output string (with same caps as the last).
			outputString += (previousInputCaps ? currentChar.toUpperCase() : currentChar.toLowerCase());
			// Set history tracking variables.
			previousPreviousInputCaps = previousInputCaps;
			//previousInputCaps = previousInputCaps; // (no need - we're using same caps as last iteration)
		}
		//   Yes, append with different capitalization from last letter.
		else {
			// Add char to output string (with caps different from the last).
			outputString += (previousInputCaps ? currentChar.toLowerCase() : currentChar.toUpperCase());
			// Set history tracking variables.
			previousPreviousInputCaps = previousInputCaps;
			previousInputCaps = !previousInputCaps;
		}

	} // end for()

	return outputString;
} // end translate()



// Load clipboard copy sound effect.
var scribbleAudioElement = document.createElement('audio');
scribbleAudioElement.setAttribute('src', 'audio/scribble-clip.mp3');
scribbleAudioElement.volume = 1.0;

// Copies current result text to clipboard.
function copyToClipboard(e) {
	// Actually copy it to the clipboard.
	document.getElementById('input-text-area').select();
	document.execCommand('copy');

	// Play sound effect.
	scribbleAudioElement.pause();
	scribbleAudioElement.currentTime = 0;
	scribbleAudioElement.play();
}
// Listen for clicks on clipboard copy button.
document.getElementById("clipboard-copy").addEventListener("click", copyToClipboard);



// Load re-randomization sound effect.
var reRandomizeAudioElement = document.createElement('audio');
reRandomizeAudioElement.setAttribute('src', 'audio/die-roll-clip-2-no-tail.mp3');
reRandomizeAudioElement.volume = 1.0;

// Re-randomizes caps staggering of current result text.
function reRandomizeStagger(e) {
	// Actually re-randomize caps staggering. (Just proc an input event)
	document.getElementById('input-text-area').dispatchEvent(new Event('input', { bubbles: true }));

	// Play sound effect.
	reRandomizeAudioElement.pause();
	reRandomizeAudioElement.currentTime = 0;
	reRandomizeAudioElement.play();
}
// Listen for clicks on rerandomization button.
document.getElementById("rerandomize").addEventListener("click", reRandomizeStagger);



// Shrink and grow the font size so it fits on screen (unless font gets way too small, in which case we'll still scroll).
(function() {
  const textarea = document.getElementById('input-text-area');
  const minFontSizePxFlat = 10;   // 10px minimum
  const maxFontSizeAsPercentOfViewportWidth = 0.04;  // 4vw max

  textarea.addEventListener('input', function() {
    let currentFontSizePx = parseFloat(window.getComputedStyle(textarea).fontSize);

    // Shrink font size if there's enough text to overflow.
    while (textarea.scrollHeight > textarea.clientHeight && currentFontSizePx > minFontSizePxFlat)
        textarea.style.fontSize = (currentFontSizePx -= 1) + 'px';

    // Grow font size if we've space.
    while (textarea.scrollHeight <= textarea.clientHeight && 
	   currentFontSizePx < (window.innerWidth * maxFontSizeAsPercentOfViewportWidth)) {
      textarea.style.fontSize = (currentFontSizePx += 1) + 'px';
      // If we overflow after incrementing, revert the last increment
      if (textarea.scrollHeight > textarea.clientHeight) {
        textarea.style.fontSize = (currentFontSizePx -= 1) + 'px';
        break;
      }
    }
  });
})();
