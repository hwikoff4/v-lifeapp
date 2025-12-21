Gemini Live API Documentation
Table of Contents
Get Started with Live API
Live API Capabilities Guide
Tool Use with Live API
Session Management with Live API
Ephemeral Tokens
Get Started with Live API
The Live API enables low-latency, real-time voice and video interactions with Gemini. It processes continuous streams of audio, video, or text to deliver immediate, human-like spoken responses, creating a natural conversational experience for your users.

Live API offers a comprehensive set of features such as Voice Activity Detection, tool use and function calling, session management (for managing long running conversations) and ephemeral tokens (for secure client-sided authentication).

Choose an Implementation Approach
When integrating with Live API, you'll need to choose one of the following implementation approaches:

Server-to-server: Your backend connects to the Live API using WebSockets. Typically, your client sends stream data (audio, video, text) to your server, which then forwards it to the Live API.

Client-to-server: Your frontend code connects directly to the Live API using WebSockets to stream data, bypassing your backend.

Note: Client-to-server generally offers better performance for streaming audio and video, since it bypasses the need to send the stream to your backend first. It's also easier to set up since you don't need to implement a proxy that sends data from your client to your server and then your server to the API. However, for production environments, in order to mitigate security risks, we recommend using ephemeral tokens instead of standard API keys.

Partner Integrations
To streamline the development of real-time audio and video apps, you can use a third-party integration that supports the Gemini Live API over WebRTC or WebSockets.

Pipecat by Daily - Create a real-time AI chatbot using Gemini Live and Pipecat.
LiveKit - Use the Gemini Live API with LiveKit Agents.
Fishjam by Software Mansion - Create live video and audio streaming applications with Fishjam.
Agent Development Kit (ADK) - Implement the Live API with Agent Development Kit (ADK).
Voximplant - Connect inbound and outbound calls to Live API with Voximplant.
Get Started
This server-side example streams audio from the microphone and plays the returned audio. The input audio format should be in 16-bit PCM, 16kHz, mono format, and the received audio uses a sample rate of 24kHz.

Python
Install helpers for audio streaming. Additional system-level dependencies (e.g. portaudio) might be required.

bash
pip install pyaudio
Note: Use headphones. This script uses the system default audio input and output, which often won't include echo cancellation. To prevent the model from interrupting itself, use headphones.

python
import asyncio
from google import genai
import pyaudio

client = genai.Client()

# --- pyaudio config ---
FORMAT = pyaudio.paInt16
CHANNELS = 1
SEND_SAMPLE_RATE = 16000
RECEIVE_SAMPLE_RATE = 24000
CHUNK_SIZE = 1024

pya = pyaudio.PyAudio()

# --- Live API config ---
MODEL = "gemini-2.5-flash-native-audio-preview-12-2025"
CONFIG = {
    "response_modalities": ["AUDIO"],
    "system_instruction": "You are a helpful and friendly AI assistant.",
}

audio_queue_output = asyncio.Queue()
audio_queue_mic = asyncio.Queue(maxsize=5)
audio_stream = None

async def listen_audio():
    """Listens for audio and puts it into the mic audio queue."""
    global audio_stream
    mic_info = pya.get_default_input_device_info()
    audio_stream = await asyncio.to_thread(
        pya.open,
        format=FORMAT,
        channels=CHANNELS,
        rate=SEND_SAMPLE_RATE,
        input=True,
        input_device_index=mic_info["index"],
        frames_per_buffer=CHUNK_SIZE,
    )
    kwargs = {"exception_on_overflow": False} if __debug__ else {}
    while True:
        data = await asyncio.to_thread(audio_stream.read, CHUNK_SIZE, **kwargs)
        await audio_queue_mic.put({"data": data, "mime_type": "audio/pcm"})

async def send_realtime(session):
    """Sends audio from the mic audio queue to the GenAI session."""
    while True:
        msg = await audio_queue_mic.get()
        await session.send_realtime_input(audio=msg)

async def receive_audio(session):
    """Receives responses from GenAI and puts audio data into the speaker audio queue."""
    while True:
        turn = session.receive()
        async for response in turn:
            if (response.server_content and response.server_content.model_turn):
                for part in response.server_content.model_turn.parts:
                    if part.inline_data and isinstance(part.inline_data.data, bytes):
                        audio_queue_output.put_nowait(part.inline_data.data)
        # Empty the queue on interruption to stop playback
        while not audio_queue_output.empty():
            audio_queue_output.get_nowait()

async def play_audio():
    """Plays audio from the speaker audio queue."""
    stream = await asyncio.to_thread(
        pya.open, format=FORMAT, channels=CHANNELS, rate=RECEIVE_SAMPLE_RATE, output=True
    )
    while True:
        bytestream = await audio_queue_output.get()
        await asyncio.to_thread(stream.write, bytestream)

async def run():
    """Main function to run the audio loop."""
    try:
        async with client.aio.live.connect(
            model=MODEL, config=CONFIG
        ) as live_session:
            print("Connected to Gemini. Start speaking!")
            async with asyncio.TaskGroup() as tg:
                tg.create_task(send_realtime(live_session))
                tg.create_task(listen_audio())
                tg.create_task(receive_audio(live_session))
                tg.create_task(play_audio())
    except asyncio.CancelledError:
        pass
    finally:
        if audio_stream:
            audio_stream.close()
        pya.terminate()
        print("\\nConnection closed.")

if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print("Interrupted by user.")
JavaScript
Install helpers for audio streaming:

bash
npm install mic speaker
javascript
import { GoogleGenAI, Modality } from '@google/genai';
import mic from 'mic';
import Speaker from 'speaker';

const ai = new GoogleGenAI({});

// --- Live API config ---
const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
const config = {
    responseModalities: [Modality.AUDIO],
    systemInstruction: "You are a helpful and friendly AI assistant.",
};

async function live() {
    const responseQueue = [];
    const audioQueue = [];
    let speaker;

    async function waitMessage() {
        while (responseQueue.length === 0) {
            await new Promise((resolve) => setImmediate(resolve));
        }
        return responseQueue.shift();
    }

    function createSpeaker() {
        if (speaker) {
            process.stdin.unpipe(speaker);
            speaker.end();
        }
        speaker = new Speaker({
            channels: 1,
            bitDepth: 16,
            sampleRate: 24000,
        });
        speaker.on('error', (err) => console.error('Speaker error:', err));
        process.stdin.pipe(speaker);
    }

    async function messageLoop() {
        while (true) {
            const message = await waitMessage();
            if (message.serverContent && message.serverContent.interrupted) {
                audioQueue.length = 0;
                continue;
            }
            if (message.serverContent && message.serverContent.modelTurn && message.serverContent.modelTurn.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        audioQueue.push(Buffer.from(part.inlineData.data, 'base64'));
                    }
                }
            }
        }
    }

    async function playbackLoop() {
        while (true) {
            if (audioQueue.length === 0) {
                if (speaker) {
                    process.stdin.unpipe(speaker);
                    speaker.end();
                    speaker = null;
                }
                await new Promise((resolve) => setImmediate(resolve));
            } else {
                if (!speaker) createSpeaker();
                const chunk = audioQueue.shift();
                await new Promise((resolve) => {
                    speaker.write(chunk, () => resolve());
                });
            }
        }
    }

    messageLoop();
    playbackLoop();

    const session = await ai.live.connect({
        model: model,
        config: config,
        callbacks: {
            onopen: () => console.log('Connected to Gemini Live API'),
            onmessage: (message) => responseQueue.push(message),
            onerror: (e) => console.error('Error:', e.message),
            onclose: (e) => console.log('Closed:', e.reason),
        },
    });

    const micInstance = mic({
        rate: '16000',
        bitwidth: '16',
        channels: '1',
    });
    const micInputStream = micInstance.getAudioStream();
    micInputStream.on('data', (data) => {
        session.sendRealtimeInput({
            audio: { data: data.toString('base64'), mimeType: "audio/pcm;rate=16000" }
        });
    });
    micInputStream.on('error', (err) => {
        console.error('Microphone error:', err);
    });
    micInstance.start();
    console.log('Microphone started. Speak now...');
}

live().catch(console.error);
Example Applications
Check out the following example applications that illustrate how to use Live API for end-to-end use cases:

Live audio starter app on AI Studio, using JavaScript libraries to connect to Live API and stream bidirectional audio through your microphone and speakers.
See the Partner integrations for additional examples and getting started guides.
What's Next
Read the full Live API Capabilities guide for key capabilities and configurations; including Voice Activity Detection and native audio features.
Read the Tool use guide to learn how to integrate Live API with tools and function calling.
Read the Session management guide for managing long running conversations.
Read the Ephemeral tokens guide for secure authentication in client-to-server applications.
Live API Capabilities Guide
Preview: The Live API is in preview.

This is a comprehensive guide that covers capabilities and configurations available with the Live API.

Before You Begin
Familiarize yourself with core concepts: If you haven't already done so, read the Get started with Live API page first. This will introduce you to the fundamental principles of the Live API, how it works, and the different implementation approaches.

Try the Live API in AI Studio: You may find it useful to try the Live API in Google AI Studio before you start building. To use the Live API in Google AI Studio, select Stream.

Establishing a Connection
The following example shows how to create a connection with an API key:

Python
python
import asyncio
from google import genai

client = genai.Client()
model = "gemini-2.5-flash-native-audio-preview-12-2025"
config = {"response_modalities": ["AUDIO"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        print("Session started")
        # Send content...

if __name__ == "__main__":
    asyncio.run(main())
JavaScript
javascript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({});
const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
const config = { responseModalities: [Modality.AUDIO] };

async function main() {
    const session = await ai.live.connect({
        model: model,
        callbacks: {
            onopen: function () { console.debug('Opened'); },
            onmessage: function (message) { console.debug(message); },
            onerror: function (e) { console.debug('Error:', e.message); },
            onclose: function (e) { console.debug('Close:', e.reason); },
        },
        config: config,
    });
    console.debug("Session started");
    // Send content...
    session.close();
}

main();
Interaction Modalities
Sending and Receiving Audio
The most common audio example, audio-to-audio, is covered in the Getting started guide.

Audio Formats
Audio data in the Live API is always raw, little-endian, 16-bit PCM. Audio output always uses a sample rate of 24kHz. Input audio is natively 16kHz, but the Live API will resample if needed so any sample rate can be sent. To convey the sample rate of input audio, set the MIME type of each audio-containing Blob to a value like audio/pcm;rate=16000.

Sending Text
Here's how you can send text:

Python:

python
message = "Hello, how are you?"
await session.send_client_content(turns=message, turn_complete=True)
JavaScript:

javascript
const message = 'Hello, how are you?';
session.sendClientContent({ turns: message, turnComplete: true });
Incremental Content Updates
Use incremental updates to send text input, establish session context, or restore session context. For short contexts you can send turn-by-turn interactions to represent the exact sequence of events:

Python:

python
turns = [
    {"role": "user", "parts": [{"text": "What is the capital of France?"}]},
    {"role": "model", "parts": [{"text": "Paris"}]},
]
await session.send_client_content(turns=turns, turn_complete=False)

turns = [{"role": "user", "parts": [{"text": "What is the capital of Germany?"}]}]
await session.send_client_content(turns=turns, turn_complete=True)
JavaScript:

javascript
let inputTurns = [
    { "role": "user", "parts": [{ "text": "What is the capital of France?" }] },
    { "role": "model", "parts": [{ "text": "Paris" }] },
]
session.sendClientContent({ turns: inputTurns, turnComplete: false })

inputTurns = [{ "role": "user", "parts": [{ "text": "What is the capital of Germany?" }] }]
session.sendClientContent({ turns: inputTurns, turnComplete: true })
For longer contexts it's recommended to provide a single message summary to free up the context window for subsequent interactions.

Audio Transcriptions
In addition to the model response, you can also receive transcriptions of both the audio output and the audio input.

Output Audio Transcription
To enable transcription of the model's audio output, send output_audio_transcription in the setup config. The transcription language is inferred from the model's response.

Python:

python
import asyncio
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-2.5-flash-native-audio-preview-12-2025"
config = {
    "response_modalities": ["AUDIO"],
    "output_audio_transcription": {}
}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        message = "Hello? Gemini are you there?"
        await session.send_client_content(
            turns={"role": "user", "parts": [{"text": message}]}, turn_complete=True
        )
        async for response in session.receive():
            if response.server_content.model_turn:
                print("Model turn:", response.server_content.model_turn)
            if response.server_content.output_transcription:
                print("Transcript:", response.server_content.output_transcription.text)

if __name__ == "__main__":
    asyncio.run(main())
Input Audio Transcription
To enable transcription of the model's audio input, send input_audio_transcription in setup config.

Python:

python
import asyncio
from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-2.5-flash-native-audio-preview-12-2025"
config = {
    "response_modalities": ["AUDIO"],
    "input_audio_transcription": {},
}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        audio_data = Path("16000.pcm").read_bytes()
        await session.send_realtime_input(
            audio=types.Blob(data=audio_data, mime_type='audio/pcm;rate=16000')
        )
        async for msg in session.receive():
            if msg.server_content.input_transcription:
                print('Transcript:', msg.server_content.input_transcription.text)

if __name__ == "__main__":
    asyncio.run(main())
Change Voice and Language
Native audio output models support any of the voices available for our Text-to-Speech (TTS) models.

To specify a voice, set the voice name within the speechConfig object as part of the session configuration:

Python:

python
config = {
    "response_modalities": ["AUDIO"],
    "speech_config": {
        "voice_config": {"prebuilt_voice_config": {"voice_name": "Kore"}}
    },
}
JavaScript:

javascript
const config = {
    responseModalities: [Modality.AUDIO],
    speechConfig: {
        voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
        }
    }
};
The Live API supports multiple languages. Native audio output models automatically choose the appropriate language and don't support explicitly setting the language code.

Native Audio Capabilities
Our latest models feature native audio output, which provides natural, realistic-sounding speech and improved multilingual performance. Native audio also enables advanced features like affective (emotion-aware) dialogue, proactive audio (where the model intelligently decides when to respond to input), and "thinking".

Affective Dialog
This feature lets Gemini adapt its response style to the input expression and tone.

Python:

python
client = genai.Client(http_options={"api_version": "v1alpha"})
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    enable_affective_dialog=True
)
JavaScript:

javascript
const ai = new GoogleGenAI({ httpOptions: {"apiVersion": "v1alpha"} });
const config = {
    responseModalities: [Modality.AUDIO],
    enableAffectiveDialog: true
};
Proactive Audio
When this feature is enabled, Gemini can proactively decide not to respond if the content is not relevant.

Python:

python
client = genai.Client(http_options={"api_version": "v1alpha"})
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    proactivity={'proactive_audio': True}
)
JavaScript:

javascript
const ai = new GoogleGenAI({ httpOptions: {"apiVersion": "v1alpha"} });
const config = {
    responseModalities: [Modality.AUDIO],
    proactivity: { proactiveAudio: true }
}
Thinking
The latest native audio output model gemini-2.5-flash-native-audio-preview-12-2025 supports thinking capabilities, with dynamic thinking enabled by default. The thinkingBudget parameter guides the model on the number of thinking tokens to use when generating a response. You can disable thinking by setting thinkingBudget to 0.

Python:

python
model = "gemini-2.5-flash-native-audio-preview-12-2025"
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"]
    thinking_config=types.ThinkingConfig(
        thinking_budget=1024,
    )
)

async with client.aio.live.connect(model=model, config=config) as session:
    # Send audio input and receive audio
JavaScript:

javascript
const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
const config = {
    responseModalities: [Modality.AUDIO],
    thinkingConfig: {
        thinkingBudget: 1024,
    },
};

async function main() {
    const session = await ai.live.connect({
        model: model,
        config: config,
        callbacks: ...,
    });
    // Send audio input and receive audio
    session.close();
}

main();
You can enable thought summaries by setting includeThoughts to true:

Python:

python
model = "gemini-2.5-flash-native-audio-preview-12-2025"
config = types.LiveConnectConfig(
    response_modalities=["AUDIO"]
    thinking_config=types.ThinkingConfig(
        thinking_budget=1024,
        include_thoughts=True
    )
)
Voice Activity Detection (VAD)
Voice Activity Detection (VAD) allows the model to recognize when a person is speaking. This is essential for creating natural conversations, as it allows a user to interrupt the model at any time.

When VAD detects an interruption, the ongoing generation is canceled and discarded. Only the information already sent to the client is retained in the session history.

Python:

python
async for response in session.receive():
    if response.server_content.interrupted is True:
        # The generation was interrupted
        # If realtime playback is implemented in your application,
        # you should stop playing audio and clear queued playback here.
JavaScript:

javascript
const turns = await handleTurn();
for (const turn of turns) {
    if (turn.serverContent && turn.serverContent.interrupted) {
        // The generation was interrupted
    }
}
Automatic VAD
By default, the model automatically performs VAD on a continuous audio input stream. VAD can be configured with the realtimeInputConfig.automaticActivityDetection field of the setup configuration.

When the audio stream is paused for more than a second, an audioStreamEnd event should be sent to flush any cached audio.

Python:

python
import asyncio
from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-live-2.5-flash-preview"
config = {"response_modalities": ["TEXT"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        audio_bytes = Path("sample.pcm").read_bytes()
        await session.send_realtime_input(
            audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
        )
        # if stream gets paused, send:
        # await session.send_realtime_input(audio_stream_end=True)

        async for response in session.receive():
            if response.text is not None:
                print(response.text)

if __name__ == "__main__":
    asyncio.run(main())
Automatic VAD Configuration
For more control over the VAD activity, you can configure the following parameters:

Python:

python
from google.genai import types

config = {
    "response_modalities": ["TEXT"],
    "realtime_input_config": {
        "automatic_activity_detection": {
            "disabled": False,  # default
            "start_of_speech_sensitivity": types.StartSensitivity.START_SENSITIVITY_LOW,
            "end_of_speech_sensitivity": types.EndSensitivity.END_SENSITIVITY_LOW,
            "prefix_padding_ms": 20,
            "silence_duration_ms": 100,
        }
    }
}
JavaScript:

javascript
import { GoogleGenAI, Modality, StartSensitivity, EndSensitivity } from '@google/genai';

const config = {
    responseModalities: [Modality.TEXT],
    realtimeInputConfig: {
        automaticActivityDetection: {
            disabled: false,  // default
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            prefixPaddingMs: 20,
            silenceDurationMs: 100,
        }
    }
};
Disable Automatic VAD
The automatic VAD can be disabled by setting realtimeInputConfig.automaticActivityDetection.disabled to true. In this configuration the client is responsible for detecting user speech and sending activityStart and activityEnd messages.

Python:

python
config = {
    "response_modalities": ["TEXT"],
    "realtime_input_config": {"automatic_activity_detection": {"disabled": True}},
}

async with client.aio.live.connect(model=model, config=config) as session:
    # ...
    await session.send_realtime_input(activity_start=types.ActivityStart())
    await session.send_realtime_input(
        audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
    )
    await session.send_realtime_input(activity_end=types.ActivityEnd())
    # ...
Token Count
You can find the total number of consumed tokens in the usageMetadata field of the returned server message.

Python:

python
async for message in session.receive():
    if message.usage_metadata:
        usage = message.usage_metadata
        print(f"Used {usage.total_token_count} tokens in total. Response token breakdown:")
        for detail in usage.response_tokens_details:
            match detail:
                case types.ModalityTokenCount(modality=modality, token_count=count):
                    print(f"{modality}: {count}")
Media Resolution
You can specify the media resolution for the input media by setting the mediaResolution field:

Python:

python
from google.genai import types

config = {
    "response_modalities": ["AUDIO"],
    "media_resolution": types.MediaResolution.MEDIA_RESOLUTION_LOW,
}
JavaScript:

javascript
import { GoogleGenAI, Modality, MediaResolution } from '@google/genai';

const config = {
    responseModalities: [Modality.TEXT],
    mediaResolution: MediaResolution.MEDIA_RESOLUTION_LOW,
};
Limitations
Response Modalities
You can only set one response modality (TEXT or AUDIO) per session in the session configuration. Setting both results in a config error message.

Client Authentication
The Live API only provides server-to-server authentication by default. If you're implementing your Live API application using a client-to-server approach, you need to use ephemeral tokens to mitigate security risks.

Session Duration
Audio-only sessions are limited to 15 minutes, and audio plus video sessions are limited to 2 minutes. However, you can configure different session management techniques for unlimited extensions on session duration.

Context Window
A session has a context window limit of:

128k tokens for native audio output models
32k tokens for other Live API models
Supported Languages
Live API supports the following languages. Note: Native audio output models automatically choose the appropriate language and don't support explicitly setting the language code.

Language	BCP-47 Code	Language	BCP-47 Code
German (Germany)	de-DE	English (Australia)*	en-AU
English (UK)*	en-GB	English (India)	en-IN
English (US)	en-US	Spanish (US)	es-US
French (France)	fr-FR	Hindi (India)	hi-IN
Portuguese (Brazil)	pt-BR	Arabic (Generic)	ar-XA
Spanish (Spain)*	es-ES	French (Canada)*	fr-CA
Indonesian (Indonesia)	id-ID	Italian (Italy)	it-IT
Japanese (Japan)	ja-JP	Turkish (Turkey)	tr-TR
Vietnamese (Vietnam)	vi-VN	Bengali (India)	bn-IN
Gujarati (India)*	gu-IN	Kannada (India)*	kn-IN
Marathi (India)	mr-IN	Malayalam (India)*	ml-IN
Tamil (India)	ta-IN	Telugu (India)	te-IN
Dutch (Netherlands)	nl-NL	Korean (South Korea)	ko-KR
Mandarin Chinese (China)*	cmn-CN	Polish (Poland)	pl-PL
Russian (Russia)	ru-RU	Thai (Thailand)	th-TH
*Languages marked with an asterisk are not available for Native audio.

Tool Use with Live API
Tool use allows Live API to go beyond just conversation by enabling it to perform actions in the real-world and pull in external context while maintaining a real time connection. You can define tools such as Function calling and Google Search with the Live API.

Overview of Supported Tools
Here's a brief overview of the available tools for Live API models:

Tool	gemini-2.5-flash-native-audio-preview-12-2025
Search	Yes
Function calling	Yes
Google Maps	No
Code execution	No
URL context	No
Function Calling
Live API supports function calling, just like regular content generation requests. Function calling lets the Live API interact with external data and programs, greatly increasing what your applications can accomplish.

You can define function declarations as part of the session configuration. After receiving tool calls, the client should respond with a list of FunctionResponse objects using the session.send_tool_response method.

Note: Unlike the generateContent API, the Live API doesn't support automatic tool response handling. You must handle tool responses manually in your client code.

Python
python
import asyncio
import wave
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-2.5-flash-native-audio-preview-12-2025"

# Simple function definitions
turn_on_the_lights = {"name": "turn_on_the_lights"}
turn_off_the_lights = {"name": "turn_off_the_lights"}

tools = [{"function_declarations": [turn_on_the_lights, turn_off_the_lights]}]
config = {"response_modalities": ["AUDIO"], "tools": tools}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        prompt = "Turn on the lights please"
        await session.send_client_content(turns={"parts": [{"text": prompt}]})

        wf = wave.open("audio.wav", "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)  # Output is 24kHz

        async for response in session.receive():
            if response.data is not None:
                wf.writeframes(response.data)
            elif response.tool_call:
                print("The tool was called")
                function_responses = []
                for fc in response.tool_call.function_calls:
                    function_response = types.FunctionResponse(
                        id=fc.id,
                        name=fc.name,
                        response={"result": "ok"}  # simple, hard-coded function response
                    )
                    function_responses.append(function_response)
                await session.send_tool_response(function_responses=function_responses)
        wf.close()

if __name__ == "__main__":
    asyncio.run(main())
JavaScript
javascript
import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from "node:fs";
import pkg from 'wavefile';
const { WaveFile } = pkg;

const ai = new GoogleGenAI({});
const model = 'gemini-2.5-flash-native-audio-preview-12-2025';

const turn_on_the_lights = { name: "turn_on_the_lights" }
const turn_off_the_lights = { name: "turn_off_the_lights" }
const tools = [{ functionDeclarations: [turn_on_the_lights, turn_off_the_lights] }]
const config = { responseModalities: [Modality.AUDIO], tools: tools }

async function live() {
    const responseQueue = [];

    async function waitMessage() {
        let done = false;
        let message = undefined;
        while (!done) {
            message = responseQueue.shift();
            if (message) {
                done = true;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        return message;
    }

    async function handleTurn() {
        const turns = [];
        let done = false;
        while (!done) {
            const message = await waitMessage();
            turns.push(message);
            if (message.serverContent && message.serverContent.turnComplete) {
                done = true;
            } else if (message.toolCall) {
                done = true;
            }
        }
        return turns;
    }

    const session = await ai.live.connect({
        model: model,
        callbacks: {
            onopen: function () { console.debug('Opened'); },
            onmessage: function (message) { responseQueue.push(message); },
            onerror: function (e) { console.debug('Error:', e.message); },
            onclose: function (e) { console.debug('Close:', e.reason); },
        },
        config: config,
    });

    const inputTurns = 'Turn on the lights please';
    session.sendClientContent({ turns: inputTurns });

    let turns = await handleTurn();
    for (const turn of turns) {
        if (turn.toolCall) {
            console.debug('A tool was called');
            const functionResponses = [];
            for (const fc of turn.toolCall.functionCalls) {
                functionResponses.push({
                    id: fc.id,
                    name: fc.name,
                    response: { result: "ok" }
                });
            }
            console.debug('Sending tool response...\\n');
            session.sendToolResponse({ functionResponses: functionResponses });
        }
    }

    turns = await handleTurn();
    const combinedAudio = turns.reduce((acc, turn) => {
        if (turn.data) {
            const buffer = Buffer.from(turn.data, 'base64');
            const intArray = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
            return acc.concat(Array.from(intArray));
        }
        return acc;
    }, []);

    const audioBuffer = new Int16Array(combinedAudio);
    const wf = new WaveFile();
    wf.fromScratch(1, 24000, '16', audioBuffer);
    fs.writeFileSync('audio.wav', wf.toBuffer());
    session.close();
}

async function main() {
    await live().catch((e) => console.error('got error', e));
}

main();
Asynchronous Function Calling
Function calling executes sequentially by default, meaning execution pauses until the results of each function call are available. If you don't want to block the conversation, you can tell the model to run the functions asynchronously.

First, add a behavior to the function definitions:

Python:

python
# Non-blocking function definitions
turn_on_the_lights = {"name": "turn_on_the_lights", "behavior": "NON_BLOCKING"}
turn_off_the_lights = {"name": "turn_off_the_lights"}  # still blocking
JavaScript:

javascript
import { GoogleGenAI, Modality, Behavior } from '@google/genai';

const turn_on_the_lights = {name: "turn_on_the_lights", behavior: Behavior.NON_BLOCKING}
const turn_off_the_lights = {name: "turn_off_the_lights"}
const tools = [{ functionDeclarations: [turn_on_the_lights, turn_off_the_lights] }]
Then tell the model how to behave when it receives the FunctionResponse using the scheduling parameter:

INTERRUPT - Interrupt what it's doing and respond right away
WHEN_IDLE - Wait until it's finished with what it's currently doing
SILENT - Do nothing and use that knowledge later on in the discussion
Python:

python
function_response = types.FunctionResponse(
    id=fc.id,
    name=fc.name,
    response={
        "result": "ok",
        "scheduling": "INTERRUPT"  # Can also be WHEN_IDLE or SILENT
    }
)
JavaScript:

javascript
import { GoogleGenAI, Modality, Behavior, FunctionResponseScheduling } from '@google/genai';

const functionResponse = {
    id: fc.id,
    name: fc.name,
    response: {
        result: "ok",
        scheduling: FunctionResponseScheduling.INTERRUPT
    }
}
Grounding with Google Search
You can enable Grounding with Google Search as part of the session configuration. This increases the Live API's accuracy and prevents hallucinations.

Python
python
import asyncio
import wave
from google import genai
from google.genai import types

client = genai.Client()
model = "gemini-2.5-flash-native-audio-preview-12-2025"
tools = [{'google_search': {}}]
config = {"response_modalities": ["AUDIO"], "tools": tools}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        prompt = "When did the last Brazil vs. Argentina soccer match happen?"
        await session.send_client_content(turns={"parts": [{"text": prompt}]})

        wf = wave.open("audio.wav", "wb")
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(24000)

        async for chunk in session.receive():
            if chunk.server_content:
                if chunk.data is not None:
                    wf.writeframes(chunk.data)
                model_turn = chunk.server_content.model_turn
                if model_turn:
                    for part in model_turn.parts:
                        if part.executable_code is not None:
                            print(part.executable_code.code)



