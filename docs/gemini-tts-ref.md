# Gemini API - Text-to-Speech and Audio Understanding Reference

## Text-to-Speech (TTS) Generation

The Gemini API can transform text input into single speaker or multi-speaker audio using native text-to-speech (TTS) generation capabilities. Text-to-speech (TTS) generation is controllable, meaning you can use natural language to structure interactions and guide the style, accent, pace, and tone of the audio.

The TTS capability differs from speech generation provided through the Live API, which is designed for interactive, unstructured audio, and multimodal inputs and outputs. While the Live API excels in dynamic conversational contexts, TTS through the Gemini API is tailored for scenarios that require exact text recitation with fine-grained control over style and sound, such as podcast or audiobook generation.

**Preview:** Native text-to-speech (TTS) is in Preview.

### Before you begin

- Ensure you use a Gemini 2.5 model variant with native text-to-speech (TTS) capabilities, as listed in the Supported models section.
- You may find it useful to test the Gemini 2.5 TTS models in AI Studio before you start building.
- **Note:** TTS models accept text-only inputs and produce audio-only outputs. For a complete list of restrictions specific to TTS models, review the Limitations section.

### Single-speaker text-to-speech

To convert text to single-speaker audio, set the response modality to "audio", and pass a SpeechConfig object with VoiceConfig set. You'll need to choose a voice name from the prebuilt output voices.

**Example (Python):**

```python
from google import genai
from google.genai import types
import wave

# Set up the wave file to save the output:
def wave_file(filename, pcm, channels=1, rate=24000, sample_width=2):
   with wave.open(filename, "wb") as wf:
      wf.setnchannels(channels)
      wf.setsampwidth(sample_width)
      wf.setframerate(rate)
      wf.writeframes(pcm)

client = genai.Client()

response = client.models.generate_content(
   model="gemini-2.5-flash-preview-tts",
   contents="Say cheerfully: Have a wonderful day!",
   config=types.GenerateContentConfig(
      response_modalities=["AUDIO"],
      speech_config=types.SpeechConfig(
         voice_config=types.VoiceConfig(
            prebuilt_voice_config=types.PrebuiltVoiceConfig(
               voice_name='Kore',
            )
         )
      ),
   )
)

data = response.candidates[0].content.parts[0].inline_data.data

file_name='out.wav'
wave_file(file_name, data) # Saves the file to current directory
```

### Multi-speaker text-to-speech

For multi-speaker audio, you'll need a MultiSpeakerVoiceConfig object with each speaker (up to 2) configured as a SpeakerVoiceConfig. You'll need to define each speaker with the same names used in the prompt:

**Example (Python):**

```python
from google import genai
from google.genai import types
import wave

# Set up the wave file to save the output:
def wave_file(filename, pcm, channels=1, rate=24000, sample_width=2):
   with wave.open(filename, "wb") as wf:
      wf.setnchannels(channels)
      wf.setsampwidth(sample_width)
      wf.setframerate(rate)
      wf.writeframes(pcm)

client = genai.Client()

prompt = """TTS the following conversation between Joe and Jane:
         Joe: How's it going today Jane?
         Jane: Not too bad, how about you?"""

response = client.models.generate_content(
   model="gemini-2.5-flash-preview-tts",
   contents=prompt,
   config=types.GenerateContentConfig(
      response_modalities=["AUDIO"],
      speech_config=types.SpeechConfig(
         multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
            speaker_voice_configs=[
               types.SpeakerVoiceConfig(
                  speaker='Joe',
                  voice_config=types.VoiceConfig(
                     prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name='Kore',
                     )
                  )
               ),
               types.SpeakerVoiceConfig(
                  speaker='Jane',
                  voice_config=types.VoiceConfig(
                     prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name='Puck',
                     )
                  )
               ),
            ]
         )
      )
   )
)

data = response.candidates[0].content.parts[0].inline_data.data

file_name='out.wav'
wave_file(file_name, data) # Saves the file to current directory
```

### Controlling speech style with prompts

You can control style, tone, accent, and pace using natural language prompts for both single- and multi-speaker TTS. For example, in a single-speaker prompt, you can say:

```
Say in an spooky whisper:
"By the pricking of my thumbs...
Something wicked this way comes"
```

In a multi-speaker prompt, provide the model with each speaker's name and corresponding transcript. You can also provide guidance for each speaker individually:

```
Make Speaker1 sound tired and bored, and Speaker2 sound excited and happy:

Speaker1: So... what's on the agenda today?
Speaker2: You're never going to guess!
```

Try using a voice option that corresponds to the style or emotion you want to convey, to emphasize it even more.

### Generating a prompt to convert to audio

The TTS models only output audio, but you can use other models to generate a transcript first, then pass that transcript to the TTS model to read aloud.

**Example:**

```python
from google import genai
from google.genai import types

client = genai.Client()

transcript = client.models.generate_content(
   model="gemini-2.0-flash",
   contents="""Generate a short transcript around 100 words that reads
            like it was clipped from a podcast by excited herpetologists.
            The hosts names are Dr. Anya and Liam.""").text

response = client.models.generate_content(
   model="gemini-2.5-flash-preview-tts",
   contents=transcript,
   config=types.GenerateContentConfig(
      response_modalities=["AUDIO"],
      speech_config=types.SpeechConfig(
         multi_speaker_voice_config=types.MultiSpeakerVoiceConfig(
            speaker_voice_configs=[
               types.SpeakerVoiceConfig(
                  speaker='Dr. Anya',
                  voice_config=types.VoiceConfig(
                     prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name='Kore',
                     )
                  )
               ),
               types.SpeakerVoiceConfig(
                  speaker='Liam',
                  voice_config=types.VoiceConfig(
                     prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name='Puck',
                     )
                  )
               ),
            ]
         )
      )
   )
)
```

### Voice options

TTS models support the following 30 voice options in the voice_name field:

| Voice | Style | Voice | Style | Voice | Style |
|-------|-------|-------|-------|-------|-------|
| Zephyr | Bright | Puck | Upbeat | Charon | Informative |
| Kore | Firm | Fenrir | Excitable | Leda | Youthful |
| Orus | Firm | Aoede | Breezy | Callirrhoe | Easy-going |
| Autonoe | Bright | Enceladus | Breathy | Iapetus | Clear |
| Umbriel | Easy-going | Algieba | Smooth | Despina | Smooth |
| Erinome | Clear | Algenib | Gravelly | Rasalgethi | Informative |
| Laomedeia | Upbeat | Achernar | Soft | Alnilam | Firm |
| Schedar | Even | Gacrux | Mature | Pulcherrima | Forward |
| Achird | Friendly | Zubenelgenubi | Casual | Vindemiatrix | Gentle |
| Sadachbia | Lively | Sadaltager | Knowledgeable | Sulafat | Warm |

You can hear all the voice options in AI Studio.

### Supported languages

The TTS models detect the input language automatically. They support the following 24 languages:

| Language | BCP-47 Code | Language | BCP-47 Code |
|----------|-------------|----------|-------------|
| Arabic (Egyptian) | ar-EG | German (Germany) | de-DE |
| English (US) | en-US | Spanish (US) | es-US |
| French (France) | fr-FR | Hindi (India) | hi-IN |
| Indonesian (Indonesia) | id-ID | Italian (Italy) | it-IT |
| Japanese (Japan) | ja-JP | Korean (Korea) | ko-KR |
| Portuguese (Brazil) | pt-BR | Russian (Russia) | ru-RU |
| Dutch (Netherlands) | nl-NL | Polish (Poland) | pl-PL |
| Thai (Thailand) | th-TH | Turkish (Turkey) | tr-TR |
| Vietnamese (Vietnam) | vi-VN | Romanian (Romania) | ro-RO |
| Ukrainian (Ukraine) | uk-UA | Bengali (Bangladesh) | bn-BD |
| English (India) | en-IN & hi-IN bundle | Marathi (India) | mr-IN |
| Tamil (India) | ta-IN | Telugu (India) | te-IN |

### Supported models

| Model | Single speaker | Multispeaker |
|-------|----------------|--------------|
| Gemini 2.5 Flash Preview TTS | ✔️ | ✔️ |
| Gemini 2.5 Pro Preview TTS | ✔️ | ✔️ |

### Limitations

- TTS models can only receive text inputs and generate audio outputs.
- A TTS session has a context window limit of 32k tokens.
- Review Languages section for language support.

### Prompting guide

The Gemini Native Audio Generation Text-to-Speech (TTS) model differentiates itself from traditional TTS models by using a large language model that knows not only what to say, but also how to say it.

To unlock this capability, users can think of themselves as directors setting a scene for a virtual voice talent to perform. To craft a prompt, we recommend considering the following components: an Audio Profile that defines the character's core identity and archetype; a Scene description that establishes the physical environment and emotional "vibe"; and Director's Notes that offer more precise performance guidance regarding style, accent and pace control.

By providing nuanced instructions such as a precise regional accent, specific paralinguistic features (e.g. breathiness), or pacing, users can leverage the model's context awareness to generate highly dynamic, natural and expressive audio performances. For optimal performance, we recommend the Transcript and directorial prompts align, so that "who is saying it" matches with "what is said" and "how it is being said."

#### Prompting structure

A robust prompt ideally includes the following elements that come together to craft a great performance:

1. **Audio Profile** - Establishes a persona for the voice, defining a character identity, archetype and any other characteristics like age, background etc.
2. **Scene** - Sets the stage. Describes both the physical environment and the "vibe".
3. **Director's Notes** - Performance guidance where you can break down which instructions are important for your virtual talent to take note of. Examples are style, breathing, pacing, articulation and accent.
4. **Sample context** - Gives the model a contextual starting point, so your virtual actor enters the scene you set up naturally.
5. **Transcript** - The text that the model will speak out. For best performance, remember that the transcript topic and writing style should correlate to the directions you are giving.

**Note:** Have Gemini help you build your prompt, just give it a blank outline of the format below and ask it to sketch out a character for you.

#### Example full prompt

```
# AUDIO PROFILE: Jaz R.
## "The Morning Hype"

## THE SCENE: The London Studio
It is 10:00 PM in a glass-walled studio overlooking the moonlit London skyline,
but inside, it is blindingly bright. The red "ON AIR" tally light is blazing.
Jaz is standing up, not sitting, bouncing on the balls of their heels to the
rhythm of a thumping backing track. Their hands fly across the faders on a
massive mixing desk. It is a chaotic, caffeine-fueled cockpit designed to wake
up an entire nation.

### DIRECTOR'S NOTES
Style:
* The "Vocal Smile": You must hear the grin in the audio. The soft palate is
always raised to keep the tone bright, sunny, and explicitly inviting.
* Dynamics: High projection without shouting. Punchy consonants and elongated
vowels on excitement words (e.g., "Beauuutiful morning").

Pace: Speaks at an energetic pace, keeping up with the fast music.  Speaks
with A "bouncing" cadence. High-speed delivery with fluid transitions — no dead
air, no gaps.

Accent: Jaz is from Brixton, London

### SAMPLE CONTEXT
Jaz is the industry standard for Top 40 radio, high-octane event promos, or any
script that requires a charismatic Estuary accent and 11/10 infectious energy.

#### TRANSCRIPT
Yes, massive vibes in the studio! You are locked in and it is absolutely
popping off in London right now. If you're stuck on the tube, or just sat
there pretending to work... stop it. Seriously, I see you. Turn this up!
We've got the project roadmap landing in three, two... let's go!
```

#### Detailed Prompting Strategies

**Audio Profile**

Briefly describe the persona of the character.

- **Name.** Giving your character a name helps ground the model and tight performance together, Refer to the character by name when setting the scene and context
- **Role.** Core identity and archetype of the character that's playing out in the scene. e.g., Radio DJ, Podcaster, News reporter etc.

**Scene**

Set the context for the scene, including location, mood, and environmental details that establish the tone and vibe. Describe what is happening around the character and how it affects them. The scene provides the environmental context for the entire interaction and guides the acting performance in a subtle, organic way.

**Director's Notes**

This critical section includes specific performance guidance. You can skip all the other elements, but we recommend you include this element.

Define only what's important to the performance, being careful to not overspecify. Too many strict rules will limit the models' creativity and may result in a worse performance. Balance the role and scene description with the specific performance rules.

The most common directions are Style, Pacing and Accent, but the model is not limited to these, nor requires them. Feel free to include custom instructions to cover any additional details important to your performance, and go into as much or as little detail as necessary.

**Style:**

Sets the tone and Style of the generated speech. Include things like upbeat, energetic, relaxed, bored etc. to guide the performance. Be descriptive and provide as much detail as necessary: "Infectious enthusiasm. The listener should feel like they are part of a massive, exciting community event." works better than simply saying "energetic and enthusiastic".

You can even try terms that are popular in the voiceover industry, like "vocal smile". You can layer as many style characteristics as you want.

**Accent:**

Describe the desired accent. The more specific you are, the better the results are. For example use "British English accent as heard in Croydon, England" vs "British Accent".

**Pacing:**

Overall pacing and pace variation throughout the piece.

**Tips:**

- Remember to keep the entire prompt coherent – the script and direction go hand in hand in creating a great performance.
- Don't feel you have to describe everything, sometimes giving the model space to fill in the gaps helps naturalness. (Just like a talented actor)
- If you ever are feeling stuck, have Gemini lend you a hand to help you craft your script or performance.

---

## Audio Understanding

Gemini can analyze and understand audio input and generate text responses to it, enabling use cases like the following:

- Describe, summarize, or answer questions about audio content.
- Provide a transcription and translation of the audio (speech to text).
- Detect and label different speakers (speaker diarization).
- Detect emotion in speech and music.
- Analyze specific segments of the audio, and provide timestamps.

**Note:** As of now the Gemini API doesn't support real-time transcription use cases. For real-time voice and video interactions refer to the Live API. For dedicated speech to text models with support for real-time transcription, use the Google Cloud Speech-to-Text API.

### Transcribe speech to text

**Example application (Python):**

```python
from google import genai
from google.genai import types

client = genai.Client()

YOUTUBE_URL = "https://www.youtube.com/watch?v=ku-N-eS1lgM"

def main():
  prompt = """
    Process the audio file and generate a detailed transcription.

    Requirements:
    1. Identify distinct speakers (e.g., Speaker 1, Speaker 2, or names if context allows).
    2. Provide accurate timestamps for each segment (Format: MM:SS).
    3. Detect the primary language of each segment.
    4. If the segment is in a language different than English, also provide the English translation.
    5. Identify the primary emotion of the speaker in this segment. You MUST choose exactly one of the following: Happy, Sad, Angry, Neutral.
    6. Provide a brief summary of the entire audio at the beginning.
  """

  response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
      types.Content(
        parts=[
          types.Part(
            file_data=types.FileData(
              file_uri=YOUTUBE_URL
            )
          ),
          types.Part(
            text=prompt
          )
        ]
      )
    ],
    config=types.GenerateContentConfig(
      response_mime_type="application/json",
      response_schema=types.Schema(
        type=types.Type.OBJECT,
        properties={
          "summary": types.Schema(
            type=types.Type.STRING,
            description="A concise summary of the audio content.",
          ),
          "segments": types.Schema(
            type=types.Type.ARRAY,
            description="List of transcribed segments with speaker and timestamp.",
            items=types.Schema(
              type=types.Type.OBJECT,
              properties={
                "speaker": types.Schema(type=types.Type.STRING),
                "timestamp": types.Schema(type=types.Type.STRING),
                "content": types.Schema(type=types.Type.STRING),
                "language": types.Schema(type=types.Type.STRING),
                "language_code": types.Schema(type=types.Type.STRING),
                "translation": types.Schema(type=types.Type.STRING),
                "emotion": types.Schema(
                  type=types.Type.STRING,
                  enum=["happy", "sad", "angry", "neutral"]
                ),
              },
              required=["speaker", "timestamp", "content", "language", "language_code", "emotion"],
            ),
          ),
        },
        required=["summary", "segments"],
      ),
    ),
  )

  print(response.text)

if __name__ == "__main__":
  main()
```

### Input audio

You can provide audio data to Gemini in the following ways:

1. Upload an audio file before making a request to generateContent.
2. Pass inline audio data with the request to generateContent.

#### Upload an audio file

You can use the Files API to upload an audio file. Always use the Files API when the total request size (including the files, text prompt, system instructions, etc.) is larger than 20 MB.

**Example:**

```python
from google import genai

client = genai.Client()

myfile = client.files.upload(file="path/to/sample.mp3")

response = client.models.generate_content(
    model="gemini-2.5-flash", contents=["Describe this audio clip", myfile]
)

print(response.text)
```

#### Pass audio data inline

Instead of uploading an audio file, you can pass inline audio data in the request to generateContent:

```python
from google import genai
from google.genai import types

with open('path/to/small-sample.mp3', 'rb') as f:
    audio_bytes = f.read()

client = genai.Client()
response = client.models.generate_content(
  model='gemini-2.5-flash',
  contents=[
    'Describe this audio clip',
    types.Part.from_bytes(
      data=audio_bytes,
      mime_type='audio/mp3',
    )
  ]
)

print(response.text)
```

**Notes about inline audio data:**

- The maximum request size is 20 MB, which includes text prompts, system instructions, and files provided inline. If your file's size will make the total request size exceed 20 MB, then use the Files API to upload an audio file for use in the request.
- If you're using an audio sample multiple times, it's more efficient to upload an audio file.

### Get a transcript

To get a transcript of audio data, just ask for it in the prompt:

```python
from google import genai

client = genai.Client()
myfile = client.files.upload(file='path/to/sample.mp3')
prompt = 'Generate a transcript of the speech.'

response = client.models.generate_content(
  model='gemini-2.5-flash',
  contents=[prompt, myfile]
)

print(response.text)
```

### Refer to timestamps

You can refer to specific sections of an audio file using timestamps of the form MM:SS. For example:

```python
# Create a prompt containing timestamps.
prompt = "Provide a transcript of the speech from 02:30 to 03:29."
```

### Count tokens

Call the countTokens method to get a count of the number of tokens in an audio file:

```python
from google import genai

client = genai.Client()
response = client.models.count_tokens(
  model='gemini-2.5-flash',
  contents=[myfile]
)

print(response)
```

### Supported audio formats

Gemini supports the following audio format MIME types:

- WAV - audio/wav
- MP3 - audio/mp3
- AIFF - audio/aiff
- AAC - audio/aac
- OGG Vorbis - audio/ogg
- FLAC - audio/flac

### Technical details about audio

- Gemini represents each second of audio as 32 tokens; for example, one minute of audio is represented as 1,920 tokens.
- Gemini can "understand" non-speech components, such as birdsong or sirens.
- The maximum supported length of audio data in a single prompt is 9.5 hours. Gemini doesn't limit the number of audio files in a single prompt; however, the total combined length of all audio files in a single prompt can't exceed 9.5 hours.
- Gemini downsamples audio files to a 16 Kbps data resolution.
- If the audio source contains multiple channels, Gemini combines those channels into a single channel.

---

**Last updated:** 2025-12-18 UTC
