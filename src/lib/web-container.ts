
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export async function getWebContainerInstance() {
  if (!webcontainerInstance) {
    try {
      webcontainerInstance = await WebContainer.boot();
      console.log("WebContainer booted successfully!");
    } catch (error) {
      console.error("Failed to boot WebContainer:", error);
      throw error;
    }
  }
  return webcontainerInstance;
}
