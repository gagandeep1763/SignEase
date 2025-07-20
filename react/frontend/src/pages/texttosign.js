import React, { useState, useEffect, useRef } from "react";
import "../styles/texttosign.css";
import logo from "../assets/logo.jpg";
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Define stop words to ignore (same as UI.py)
const STOP_WORDS = new Set([
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'the', 'a', 'an',
  'to', 'of', 'for', 'in', 'on', 'at', 'by', 'with',
  'and', 'or', 'but',
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'this', 'that', 'these', 'those',
  'do', 'does', 'did',
  'have', 'has', 'had',
  'will', 'would', 'shall', 'should',
  'could', 'may', 'might',
  'must', 'ought'
]);

// Common verb forms and their base forms
const VERB_FORMS = {
  'ing': [''], // running -> run
  'ed': ['', 'e'], // jumped -> jump, danced -> dance
  's': [''], // runs -> run
  'ies': ['y'], // flies -> fly
  'es': [''], // watches -> watch
};

// Common plural forms and their singular forms
const PLURAL_FORMS = {
  's': [''], // cats -> cat
  'ies': ['y'], // babies -> baby
  'es': [''], // boxes -> box
  'ves': ['f', 'fe'], // wolves -> wolf, knives -> knife
};

function TextToSign() {
  const [text, setText] = useState("");
  const [signData, setSignData] = useState({
    wordToVideo: {},
    glossToVideo: {},
    compoundWords: new Set(),
    baseFormMap: new Map() // Maps variations to base forms
  });
  const [videoQueue, setVideoQueue] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const videoRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Loading and parsing the CSV file from public folder
    fetch('/data/index.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        const rows = data.split('\n').slice(1); 
        const wordToVideo = {};
        const glossToVideo = {};
        const compoundWords = new Set();
        const baseFormMap = new Map();
        
        rows.forEach(row => {
          if (!row.trim()) return;
          const [path, spoken, signed, start, end, words, glosses] = row.split(',');
          if (path && words && words.toLowerCase() !== 'nan') {
            const normalizedWord = words.toLowerCase().trim();
            wordToVideo[normalizedWord] = path.trim();
            
            // Store compound words
            if (normalizedWord.includes(' ')) {
              compoundWords.add(normalizedWord);
            }
            
            // Generate and store word variations
            const variations = generateWordVariations(normalizedWord);
            variations.forEach(variation => {
              baseFormMap.set(variation, normalizedWord);
            });

            if (glosses) {
              glossToVideo[glosses.trim().toLowerCase()] = path.trim();
            }
          }
        });

        setSignData({ wordToVideo, glossToVideo, compoundWords, baseFormMap });
        setDebug(`Loaded ${Object.keys(wordToVideo).length} words (${compoundWords.size} compound) with ${baseFormMap.size} variations`);
        console.log("Word mappings:", wordToVideo);
        console.log("Base form mappings:", baseFormMap);
      })
      .catch(error => {
        console.error('Error loading sign data:', error);
        setError(`Failed to load sign data: ${error.message}`);
      });
  }, []);

  const generateWordVariations = (baseWord) => {
    const variations = new Set([baseWord]);
    
    // not to generate variations for compound words
    if (baseWord.includes(' ')) {
      return variations;
    }

    // Generate verb forms
    Object.entries(VERB_FORMS).forEach(([suffix, possibleRemovals]) => {
      possibleRemovals.forEach(removal => {
        if (baseWord.endsWith(removal)) {
          const stem = baseWord.slice(0, -removal.length);
          variations.add(stem + suffix); // Add verb form
        }
      });
    });

    // Generate plural forms
    Object.entries(PLURAL_FORMS).forEach(([suffix, possibleRemovals]) => {
      possibleRemovals.forEach(removal => {
        if (baseWord.endsWith(removal)) {
          const stem = baseWord.slice(0, -removal.length);
          variations.add(stem + suffix); // Add plural form
        }
      });
    });

    // common prefixes for future tense
    variations.add('will ' + baseWord);
    variations.add('going to ' + baseWord);

    // common prefixes for past tense
    variations.add('have ' + baseWord);
    variations.add('has ' + baseWord);
    variations.add('had ' + baseWord);

    // common prefixes for continuous tense
    if (!baseWord.endsWith('ing')) {
      variations.add('is ' + baseWord + 'ing');
      variations.add('are ' + baseWord + 'ing');
      variations.add('was ' + baseWord + 'ing');
      variations.add('were ' + baseWord + 'ing');
    }

    return variations;
  };

  const handleReset = () => {
    setText("");
    setVideoQueue([]);
    setCurrentVideoIndex(0);
    setIsPlaying(false);
    setError("");
  };

  const processText = (text) => {
    const { wordToVideo, compoundWords, baseFormMap } = signData;
    const words = [];
    
    // normalize the input text
    const normalizedInput = text.trim();
    
    // match the complete input text with various normalizations
    const variations = [
      normalizedInput,
      normalizedInput.toLowerCase(),
      normalizedInput.replace(/'/g, "'"), // Replace straight quotes with curly quotes
      normalizedInput.toLowerCase().replace(/'/g, "'"),
      // Add more variations as needed
    ];

    // Check if any variation exists in wordToVideo
    for (const variant of variations) {
      if (wordToVideo[variant]) {
        return [variant];
      }
    }

    // If no exact match found, trying to match the largest possible phrases
    let remaining = normalizedInput.toLowerCase();
    while (remaining.length > 0) {
      let found = false;
      
      // Trying to match the largest possible substring first
      let testPhrase = remaining;
      while (testPhrase.length > 0) {
        // Trying different variations of the test phrase
        const testVariations = [
          testPhrase,
          testPhrase.replace(/'/g, "'"),
          testPhrase.replace(/dont/g, "don't"),
          testPhrase.replace(/cant/g, "can't"),
          // Add more common contractions as needed
        ];

        for (const variant of testVariations) {
          if (wordToVideo[variant]) {
            words.push(variant);
            remaining = remaining.slice(testPhrase.length).trim();
            found = true;
            break;
          }
        }
        if (found) break;

        // Trying compound words
        if (compoundWords.has(testPhrase)) {
          words.push(testPhrase);
          remaining = remaining.slice(testPhrase.length).trim();
          found = true;
          break;
        }

        // Remove the last word for next iteration
        const lastSpaceIndex = testPhrase.lastIndexOf(' ');
        if (lastSpaceIndex === -1) break;
        testPhrase = testPhrase.substring(0, lastSpaceIndex).trim();
      }
      
      // If no phrase match found, process the next single word
      if (!found) {
        const match = remaining.match(/^[\w'-]+/);
        if (match) {
          const word = match[0];
          // Only filter out stop words if they're not part of a verb phrase
          const nextWord = remaining.slice(match[0].length).trim().split(/\s+/)[0];
          const isVerbPhrase = word === 'is' && nextWord && nextWord.endsWith('ing');
          
          if (!STOP_WORDS.has(word) || isVerbPhrase) {
            // If it's a word with 'ing', try to find its base form
            if (word.endsWith('ing')) {
              let baseWord = word.slice(0, -3); // Remove 'ing'
              let found = false;

              // Try different base form possibilities
              const possibleBaseForms = [
                baseWord, // jump -> jumping
                baseWord + 'e', // write -> writing
                baseWord.slice(0, -1), // running -> run
                baseWord + baseWord.slice(-1) // sitting -> sit
              ];

              // Try to find a matching base form
              for (const baseForm of possibleBaseForms) {
                // Check in our word mappings
                if (wordToVideo[baseForm]) {
                  words.push(baseForm);
                  found = true;
                  break;
                }
                // Check in our base form mappings
                for (const [variation, base] of baseFormMap.entries()) {
                  if (variation === baseForm) {
                    words.push(base);
                    found = true;
                    break;
                  }
                }
                if (found) break;
              }

              // If no base form found, add the original word
              if (!found) {
                words.push(word);
              }
            } else {
              words.push(word);
            }
          }
          remaining = remaining.slice(word.length).trim();
        } else {
          // Skip any non-word characters
          remaining = remaining.slice(1).trim();
        }
      }
    }
    
    // Keep all words, including duplicates
    return words;
  };

  const findMatchingVideo = (phrase) => {
    const { wordToVideo, glossToVideo, baseFormMap } = signData;
    
    const normalizedPhrase = phrase.toLowerCase().trim();
    
    // Try exact phrase match first
    if (wordToVideo[normalizedPhrase]) {
      return { word: normalizedPhrase, url: wordToVideo[normalizedPhrase] };
    }

    // Try base form match
    const baseForm = baseFormMap.get(normalizedPhrase);
    if (baseForm && wordToVideo[baseForm]) {
      return { word: baseForm, url: wordToVideo[baseForm] };
    }

    // Try gloss match
    const upperPhrase = normalizedPhrase.toUpperCase();
    if (glossToVideo[upperPhrase.toLowerCase()]) {
      return { word: normalizedPhrase, url: glossToVideo[upperPhrase.toLowerCase()] };
    }

    // Try to match without tense markers
    const withoutTense = normalizedPhrase
      .replace(/^(will|going to|have|has|had|is|are|was|were)\s+/, '')
      .replace(/\s+(ing|ed)$/, '');
    
    if (wordToVideo[withoutTense]) {
      return { word: withoutTense, url: wordToVideo[withoutTense] };
    }

    // If the word ends in 'ing', try different base forms
    if (normalizedPhrase.endsWith('ing')) {
      const baseWord = normalizedPhrase.slice(0, -3);
      const possibleBaseForms = [
        baseWord, // jump -> jumping
        baseWord + 'e', // write -> writing
        baseWord.slice(0, -1), // running -> run
        baseWord + baseWord.slice(-1) // sitting -> sit
      ];

      for (const base of possibleBaseForms) {
        if (wordToVideo[base]) {
          return { word: base, url: wordToVideo[base] };
        }
      }
    }

    return null;
  };

  const handleVideoEnd = () => {
    console.log("Video ended, current index:", currentVideoIndex, "queue length:", videoQueue.length);
    if (currentVideoIndex < videoQueue.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentVideoIndex(0);
    }
  };

  const handleConvert = () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    // Try to match the entire input first
    const exactMatch = findMatchingVideo(text.trim());
    if (exactMatch) {
      setVideoQueue([exactMatch]);
      setCurrentVideoIndex(0);
      setIsPlaying(true);
      setError("");
      setDebug(`Playing exact phrase match: ${exactMatch.word}`);
      return;
    }

    const words = processText(text);
    console.log("Processing words:", words);

    if (words.length === 0) {
      setError("No meaningful words found after processing");
      return;
    }

    const videos = [];
    const notFound = [];

    // Find videos for each word/phrase
    words.forEach(word => {
      const match = findMatchingVideo(word);
      if (match) {  
        videos.push(match);
      } else {
        notFound.push(word);
      }
    });

    if (videos.length === 0) {
      setError(`No signs found for any words in "${text}"`);
      setDebug(`No matches found for words: ${words.join(', ')}`);
      return;
    }

    if (notFound.length > 0) {
      setDebug(`Warning: No signs found for words: ${notFound.join(', ')}`);
    }

    setVideoQueue(videos);
    setCurrentVideoIndex(0);
    setIsPlaying(true);
    setError("");
    setDebug(`Playing ${videos.length} signs: ${videos.map(v => v.word).join(' → ')}`);
  };

  return (
    <div className="text-to-sign-page">
      <header className="header">
        <div className="logo-container">
          <img src={logo} alt="SignEase Logo" className="logo" />
        </div>
        <nav className="nav-links">
          <Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Home</Link>
          <Link to="/sign-concepts" className={location.pathname === "/sign-concepts" ? "active" : ""}>Sign Concepts</Link>
          <Link to="/key-points" className={location.pathname === "/key-points" ? "active" : ""}>Key Points</Link>
          <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact us</Link>
        </nav>
        <button className="logout-btn" onClick={() => navigate('/')}>LOG OUT</button>
      </header>

      <button className="back-button" onClick={() => navigate('/sign-concepts')}>BACK</button>

      <h2 className="title">Text to Sign from Sign Ease</h2>

      <div className="conversion-table">
        <div className="table-row table-header">
          <div className="table-cell">
            <div className="text-header">
              <span>Text</span>
              <button onClick={handleReset} className="refresh-btn" title="Reset">
                ↺
              </button>
            </div>
          </div>
          <div className="table-cell">
            <span>Sign Animation</span>
          </div>
        </div>

        <div className="table-row">
          <div className="table-cell">
            <div className="text-cell">
              <textarea
                className="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text here..."
              />
              <button onClick={handleConvert} className="convert-button">
                Convert
              </button>
              {error && <div className="error-message">{error}</div>}
              {debug && <div className="debug-message">{debug}</div>}
            </div>
          </div>
          <div className="table-cell sign-box">
            {isPlaying && videoQueue.length > 0 && currentVideoIndex < videoQueue.length ? (
              <>
                <video 
                  ref={videoRef}
                  key={videoQueue[currentVideoIndex].url}
                  className="sign-video"
                  src={videoQueue[currentVideoIndex].url}
                  controls={false}
                  autoPlay
                  onEnded={handleVideoEnd}
                  onError={(e) => {
                    console.error('Video error:', e);
                    setError('Failed to load video. Please check console for details.');
                    setDebug(`Video error for word "${videoQueue[currentVideoIndex].word}": ${e.target.error?.message || 'Unknown error'}`);
                    handleVideoEnd(); // Skip to next video on error
                  }}
                />
                <div className="video-progress">
                  Playing: {videoQueue[currentVideoIndex].word} ({currentVideoIndex + 1} of {videoQueue.length})
                </div>
              </>
            ) : (
              <div className="no-video-message">
                {error || "Enter text and click Convert to see sign language"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="help-text">
        <p>Tips:</p>
        <ul>
          <li>Common words like 'is', 'am', 'the', etc. are ignored</li>
          <li>Enter full sentences - each word will be signed in sequence</li>
          <li>Available words: {Object.keys(signData.wordToVideo).slice(0, 5).join(', ')}...</li>
        </ul>
      </div>
    </div>
  );
}

export default TextToSign;
