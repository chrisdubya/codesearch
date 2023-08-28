export class CodeClient {
  repos = [];
  selectedRepos = [];
  updateRepos = async (accessToken, initialRun = false) => {
    var myHeaders = new Headers();
    myHeaders.append(`Authorization`, `Bearer ${accessToken}`); // https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    try {
      const response = await fetch('https://api.github.com/user/repos', requestOptions);

      if (!response.ok) {
        throw new Error(response.status);
      }

      const data = await response.json();

      // Save data to localStorage for future use
      localStorage.setItem('repos', JSON.stringify(data));

      window.codeClient = new CodeClient();
      window.codeClient.repos = data;
      !initialRun && window.hooks.emit('codesearch:reposUpdated');
    } catch (e) {
      console.error(e, 'error fetching repos');
    }
  }
}

async function _handleCodeSearchSkill(event) {
  const repoQueries = window.codeClient.selectedRepos.map((repo) => `repo%3A${encodeURIComponent(repo)}`).join(' OR ');

  const completeQuery = `${event.value}+(${repoQueries})`;

  const baseSearchURL = "https://github.com/search?q=";
  const searchType = "&type=code&ref=advsearch";
  const completeURL = `${baseSearchURL}${completeQuery}${searchType}`;

  window.open(completeURL, '_blank')
  window.companion.SendMessage({type: "CODE_SEARCH", user: event.name, value: event.value});
}

export async function preload() {
  window.codeClient = new CodeClient();
  const localSelectedRepoData = localStorage.getItem('checkedRepos');
  if (localSelectedRepoData) {
    // If data is available in localStorage, use it
    window.codeClient.selectedRepos = JSON.parse(localSelectedRepoData);
  }

  const localRepoData = localStorage.getItem('repos');
  if (localRepoData) {
    // If data is available in localStorage, use it
    window.codeClient.repos = JSON.parse(localRepoData);
  } else {
    const storedAccessToken = localStorage.getItem('githubAccessToken');
    if (storedAccessToken) {
      const accessToken = JSON.parse(storedAccessToken);
      await window.codeClient.updateRepos(accessToken, true);
    }
  }
}

export function init() {
  window.hooks.on('codesearch:handle_code_search_skill', _handleCodeSearchSkill)
  window.hooks.on('codesearch:reposChange', (repos) => {
    return CodeClient.selectedRepos = repos
   });
  window.components.AddComponentToScreen('codesearch-settings-container', 'CodeSearchSettings')
  window.hooks.emit('codesearch:repos', window.codeClient.repos)
}
