export namespace Native
{
    export function closeGame(exit = false)
    {
        if (typeof nativeCloseGameApp === 'function')
        {
            nativeCloseGameApp();
        }
        else
        {
            if (exit) {
                window.location.href = "native://close/?param=exit";
            } else {
                window.location.href = "native://close/";
            }
        }
    }
    
    export function callApp(param: string)
    {
        if (typeof gameCallback == 'function')
        {
            gameCallback(param);
        }
        else
        {
            window.location.href = "native://gameCallback/?param=" + encodeURIComponent(param);
        }
    }
}
