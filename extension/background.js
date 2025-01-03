const CLIENT_ID = "1026063056230-0sn048d45vm2dqo480fldff3r9dl3ie0.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

/**
 * Função para autenticar o usuário com OAuth 2.0.
 */
function authenticate() {
  return new Promise((resolve, reject) => {
    const redirectUri = chrome.identity.getRedirectURL();
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${redirectUri}&scope=${SCOPES}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(new Error(chrome.runtime.lastError?.message || "Falha na autenticação."));
        }

        const accessToken = new URL(redirectUrl).hash.match(/access_token=([^&]*)/);
        if (accessToken) {
          resolve(accessToken[1]);
        } else {
          reject(new Error("Token de acesso não encontrado."));
        }
      }
    );
  });
}

/**
 * Função para buscar vídeos da playlist "Assistir mais tarde".
 */
async function getYouTubePlaylistVideos(accessToken) {
  const PLAYLIST_ID = "WL"; // Playlist "Assistir mais tarde"
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${PLAYLIST_ID}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Erro na API do YouTube.");
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Erro ao acessar a API do YouTube:", error);
    throw error;
  }
}

/**
 * Listener para mensagens do popup.
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "getVideos") {
    try {
      const accessToken = await authenticate();
      const videos = await getYouTubePlaylistVideos(accessToken);
      sendResponse({ items: videos });
    } catch (error) {
      console.error("Erro ao obter vídeos:", error);
      sendResponse({ error: error.message });
    }
  }
  return true; // Indica que a resposta será enviada de forma assíncrona.
});
