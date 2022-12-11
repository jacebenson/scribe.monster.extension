function estimateTokens({ action, prompt, input }) {
    //console.log({ function: 'estimateTokens', action, actionLength: action?.length, input, inputLength: input?.length, prompt, promptLength: prompt?.length })
    let promptTokens = prompt / 3.75 || 0
    let inputTokens = input / 3.75 || 0
    let estimate = 0;
    //console.log({ message: 'precheck', action, promptTokens, inputTokens, isExplain: action === 'explain' })
    if (action === 'edit') {
        // return the rounded up value of 2*input + prompt
        //console.log({ action, promptTokens, inputTokens })
        estimate = Math.ceil(2 * inputTokens + promptTokens)
        return estimate
    }
    if (action === 'complete') {
        // return the rounded up value of input[0] + prompt + 2000
        //console.log({ action, promptTokens, inputTokens })
        estimate = Math.ceil(100/*est for line 1 of code */ + promptTokens + 2000)
        return estimate
    }
    if (action === "explain") {
        // return the rounded up value of prompt + 1000
        //console.log({ action, promptTokens, inputTokens })
        estimate = Math.ceil(promptTokens + inputTokens + 1000)
        return estimate
    }
}