
export interface AINote {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  filename: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export async function generateNotesAI(text: string, filename: string): Promise<AINote> {
  // Structured prompt for detailed Markdown notes
  const prompt = `You are a top-tier AI study assistant. Your task is to generate **detailed and well-structured study notes** from the given content.

Instructions:
- Do **not** omit or overly summarize important content — include as much relevant detail as possible.
- Organize the notes using **clear and consistent headings**, subheadings, and bullet points.
- Ensure the notes cover:
  - All **main ideas** and **key concepts**
  - Important **definitions**, **examples**, and **explanations**
  - Any **lists**, **processes**, or **formulas** mentioned
- If the content is long or complex, break the notes into **logical sections and subsections**.
- Prioritize **clarity, completeness, and usefulness** for exam preparation and in-depth revision.
- The final output should feel like comprehensive classroom notes taken by a top student.
- Use proper Markdown formatting for all structure (e.g., #, ##, ###, -, *, 1., etc.).

Here is the content to convert into notes:

${text}
`;

  try {
    let response;
    try {
      response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'together' })
      });
    } catch (error) {
      // Fallback to summarize endpoint if ai endpoint is not available
      response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      });
    }

    if (!response.ok) {
      throw new Error('Failed to generate notes');
    }

    const data = await response.json();
    // DO NOT CLEAN MARKDOWN! Render as Markdown in your UI for structure

    const note: AINote = {
      id: Date.now().toString(),
      title: `Notes from ${filename}`,
      content: data.response || data.summary || 'Notes generated successfully',
      timestamp: new Date().toISOString(),
      filename
    };

    return note;
  } catch (error) {
    console.error('Error generating notes:', error);
    throw new Error('Failed to generate AI notes. Please try again.');
  }
}
export async function generateFlashcardsAI(notesText: string): Promise<Flashcard[]> {
  const prompt = `Create 10-15 study flashcards from these notes. 
  Each flashcard should have a clear question and a concise answer.
  Format as JSON array with objects containing "question" and "answer" fields:

  ${notesText}`;

  try {
    let response;
    try {
      response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'gemini' })
      });
    } catch (error) {
      // Create flashcards from the notes text directly
      return parseFlashcardsFromText(notesText);
    }

    if (!response.ok) {
      throw new Error('Failed to generate flashcards');
    }

    const data = await response.json();
    
    // Try to parse JSON from the response
    let flashcards;
    try {
      const jsonMatch = data.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse line by line
        flashcards = parseFlashcardsFromText(data.response);
      }
    } catch {
      flashcards = parseFlashcardsFromText(data.response);
    }

    return flashcards.map((card: any, index: number) => ({
      id: (Date.now() + index).toString(),
      question: card.question || card.q || '',
      answer: card.answer || card.a || ''
    })).filter((card: Flashcard) => card.question && card.answer);

  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

function parseFlashcardsFromText(text: string): Flashcard[] {
  const lines = text.split('\n').filter(line => line.trim());
  const flashcards: Flashcard[] = [];
  
  // Try to extract Q&A patterns from the text
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for question patterns
    if (line.match(/^(Q:|Question:|What|How|Why|When|Where|Which)/i)) {
      const question = line.replace(/^(Q:|Question:)\s*/i, '').trim();
      
      // Look for the answer in the next few lines
      let answer = '';
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.match(/^(A:|Answer:)/i)) {
          answer = nextLine.replace(/^(A:|Answer:)\s*/i, '').trim();
          break;
        } else if (nextLine && !nextLine.match(/^(Q:|Question:|What|How|Why|When|Where|Which)/i)) {
          answer = nextLine;
          break;
        }
      }
      
      if (question && answer) {
        flashcards.push({
          id: (Date.now() + flashcards.length).toString(),
          question,
          answer
        });
      }
    }
  }
  
  // If no Q&A patterns found, create flashcards from bullet points or sentences
  if (flashcards.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    for (let i = 0; i < Math.min(sentences.length - 1, 10); i += 2) {
      if (sentences[i] && sentences[i + 1]) {
        flashcards.push({
          id: (Date.now() + i).toString(),
          question: sentences[i].trim() + '?',
          answer: sentences[i + 1].trim()
        });
      }
    }
  }
  
  return flashcards.slice(0, 15); // Limit to 15 flashcards
}
