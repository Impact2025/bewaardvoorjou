const express = require('express');
const cors = require('cors');
const app = express();
const port = 8001;
const crypto = require('crypto');

// Middleware
app.use(cors());
app.use(express.json());

// Mock login endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock validation
  if (email && password) {
    res.json({
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      primary_journey_id: 'journey-123',
      user: {
        id: 1,
        display_name: 'Test User',
        email: email,
        country: 'NL',
        locale: 'nl',
        privacy_level: 'private',
        created_at: new Date().toISOString()
      }
    });
  } else {
    res.status(400).json({
      detail: 'Invalid credentials'
    });
  }
});

// Mock register endpoint
app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  
  if (email && password && first_name && last_name) {
    res.status(201).json({
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      primary_journey_id: 'journey-123',
      user: {
        id: 1,
        display_name: first_name + ' ' + last_name,
        email: email,
        country: 'NL',
        locale: 'nl',
        privacy_level: 'private',
        created_at: new Date().toISOString()
      }
    });
  } else {
    res.status(400).json({
      detail: 'Missing required fields'
    });
  }
});

// Mock assistant prompt endpoint
app.post('/api/v1/assistant/prompt', (req, res) => {
  const { chapter_id } = req.body;
  
  // Define prompts for different chapters
  const prompts = {
    roots: "Waar ben je opgegroeid en welke plekken voelen als thuis?",
    music: "Welk liedje brengt je meteen terug naar een speciaal moment in je leven?",
    milestones: "Wat was het keerpunt in je leven dat je tot wie je nu bent heeft gevormd?",
    humor: "Wat is het grappigste dat je ooit per ongeluk hebt gezegd of gedaan?",
    lessons: "Welke levensles zou je graag aan je jongere zelf hebben doorgegeven?",
    people: "Wie is iemand die je leven heeft veranderd zonder dat die dat wist?",
    message: "Als je één boodschap kon nalaten voor iemand die je lief is, wat zou die zijn?"
  };
  
  const prompt = prompts[chapter_id] || "Vertel eens over een moment dat je nog niemand hebt toevertrouwd. Wat maakte het zo bijzonder?";
  
  res.json({ prompt });
});

// Mock media presign endpoint
app.post('/api/v1/media/presign', (req, res) => {
  const { journey_id, chapter_id, modality, filename, size_bytes } = req.body;
  
  // Generate a mock asset ID
  const assetId = `asset_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  // Generate a mock upload URL
  const uploadUrl = `http://localhost:${port}/mock-upload/${assetId}`;
  
  res.json({
    upload_url: uploadUrl,
    asset_id: assetId,
    upload_method: "PUT",
    fields: null
  });
});

// Mock upload endpoint
app.put('/mock-upload/:assetId', (req, res) => {
  // In a real implementation, this would handle the file upload
  // For our mock, we'll just acknowledge the upload
  console.log(`Mock upload received for asset ${req.params.assetId}`);
  res.status(200).send('Upload successful');
});

// Mock media complete endpoint
app.post('/api/v1/media/:assetId/complete', (req, res) => {
  const { assetId } = req.params;
  console.log(`Mock media completion for asset ${assetId}`);
  res.status(200).json({ message: 'Media processing completed' });
});

// Mock endpoint to get user journey
app.get('/api/v1/journeys/:journeyId', (req, res) => {
  const { journeyId } = req.params;
  
  // Return mock journey data with active chapters
  res.status(200).json({
    id: journeyId,
    title: "Mijn Levensreis",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    progress: {
      "roots": 25,
      "music": 0,
      "milestones": 0,
      "humor": 0,
      "lessons": 0,
      "people": 0,
      "message": 0
    },
    active_chapters: ["roots"], // Roots is active by default
    media: [],
    prompt_runs: [],
    transcripts: [],
    highlights: [],
    share_grants: [],
    legacy_policy: null,
    consent_log: [],
    owner: {
      id: "1",
      display_name: "Test Gebruiker",
      email: "test@example.com",
      locale: "nl",
      country: "NL",
      birth_year: 1990,
      accessibility: {
        captions: false,
        high_contrast: false,
        large_text: false
      },
      privacy_level: "private",
      target_recipients: [],
      deadlines: []
    }
  });
});

// Mock endpoint for updating activated chapters
app.post('/api/v1/journeys/:journeyId/activate-chapters', (req, res) => {
  const { journeyId } = req.params;
  const { chapter_ids } = req.body;
  
  console.log(`Mock chapter activation for journey ${journeyId}:`, chapter_ids);
  
  // Return the same chapter IDs that were sent
  res.status(200).json(chapter_ids || ["roots"]);
});

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Mock backend server running at http://localhost:${port}`);
});