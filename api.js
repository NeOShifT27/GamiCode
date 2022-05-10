

async function apiGit() {
    console.log('je suis dans la fonction')
    const octokit = new Octokit({
        auth: 'personal-access-token123'
    })

    let result = await octokit.request('GET /repos/{NeOShifT27}/{GamiCode}/commits', {
        owner: 'OWNER',
        repo: 'REPO'
    })
    console.log(result)
}


apiGit()