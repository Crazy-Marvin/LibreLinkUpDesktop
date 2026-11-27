export class AudioManager {
  private static instance: AudioManager;

  private audioInstance: HTMLAudioElement | null = null;

  private isPlaying: boolean = false;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async playAudio(audioFilePath: string): Promise<void> {
    try {

      if (this.isPlaying) {
        console.log("Audio is already playing. Skipping...");
        return;
      }

      this.audioInstance = new Audio(audioFilePath);

      this.audioInstance.onplay = () => {
        this.isPlaying = true;
        console.log("Audio started playing.");
      };

      this.audioInstance.onended = () => {
        this.isPlaying = false;
        console.log("Audio playback finished.");
      };

      await this.audioInstance.play();
    } catch (err) {
      console.error("Error playing audio:", err);
      this.isPlaying = false;
    }
  }
}
