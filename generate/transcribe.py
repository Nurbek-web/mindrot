from flask import Flask, jsonify, request
import whisper_timestamped as whisper
import json
import os

app = Flask(__name__)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        data = request.json
        audio_path = data.get('audio_path')
        print(audio_path)

        if not audio_path:
            raise ValueError("The 'audio_path' is not provided in the request.")
        
        if not os.path.isfile(audio_path):
            raise FileNotFoundError(f"The file at path {audio_path} does not exist.")
        
        app.logger.info(f'Transcribing audio file at path: {audio_path}')

        audio = whisper.load_audio(audio_path)
        model = whisper.load_model("tiny", device="cpu")
        transcribed = whisper.transcribe(model, audio, language="en")
        return jsonify(transcribed)
    except Exception as e:
        app.logger.error(f'An error occurred during transcription: {e}')
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
