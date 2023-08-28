const React = window.react;
const { useState, useEffect } = React;

export const StockTicker = () => {
  const [accessToken, setAccessToken] = useState('');
  const [repos, setRepos] = useState([]);
  const [checkedRepos, setCheckedRepos] = useState([]);

  useEffect(() => {
    window.hooks.on('codesearch:reposUpdated', () => {
      setRepos(window.codeClient.repos);
    });
  }, [])

  // Load the initial checked repos from localStorage on mount
  useEffect(() => {
    const storedRepos = localStorage.getItem('checkedRepos');
    if (storedRepos) {
      setCheckedRepos(JSON.parse(storedRepos));
    }
  }, []);

  // Load the initial API Key on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('githubAccessToken');
    if (storedAccessToken) {
      setAccessToken(JSON.parse(storedAccessToken));
    }
  }, []);

  // Update repos from your client
  useEffect(() => {
    setRepos(window.codeClient.repos)
  }, []);

  // Save checked repos to localStorage whenever they change
  useEffect(() => {
    window.hooks.emit('codesearch:reposChange')
    localStorage.setItem('checkedRepos', JSON.stringify(checkedRepos));
  }, [checkedRepos]);

  // Save access token whenever it changes
  useEffect(() => {
    console.log(accessToken)
    localStorage.setItem('githubAccessToken', JSON.stringify(accessToken));
  }, [accessToken]);

  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    const isChecked = event.target.checked;

    setCheckedRepos(prevCheckedRepos => {
      const updatedCheckedRepos = isChecked
        ? [...prevCheckedRepos, value]
        : prevCheckedRepos.filter(repo => repo !== value);

      return updatedCheckedRepos;
    });
  };

  const handleTokenChange = (event) => {
    const value = event.target.value;
    if (event.target.value !== '') {
      setAccessToken(value);
    }
  }

  const handleUpdateRepos = () => {
    window.codeClient.updateRepos(accessToken);
  }

  return (
    <div style={{ color: '#fff' }}>
      <h3>Code Search Settings</h3>

      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label>Github Access Token:</label>
          <input type='text' onChange={handleTokenChange} value={accessToken}></input>
        </div>
        <div>
          {repos.length && accessToken ? (
            <React.Fragment>
              <label>Repos: (check repos to search)</label>
              <div style={{ height: '150px', overflowY: 'scroll'}}>
                {repos.map((repo, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`repo-${index}`}
                      name={`repo-${index}`}
                      value={repo.full_name}
                      checked={checkedRepos.includes(repo.full_name)}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor={`repo-${index}`}>{repo.full_name}</label>
                  </div>
                ))}
              </div>
            </React.Fragment>
          ) : null}
        </div>
        <button onClick={handleUpdateRepos}>update repos</button>
      </div>
    </div>
  )
}
