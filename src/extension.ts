import * as vscode from 'vscode'
import EmojiCompletionProvider from './EmojiCompletionProvider'
import { EmojiProvider } from './emoji'
import Configuration from './configuration'
import DecoratorProvider from "./DecoratorProvider";

function registerProviders(
    provider: EmojiCompletionProvider,
    config: Configuration
): vscode.Disposable {
    const disposables: vscode.Disposable[] = []
    for (const language of config.languages) {
        if (config.shouldShowOnColon(language)) {
            disposables.push(vscode.languages.registerCompletionItemProvider(language, provider, ':'))
        } else {
            disposables.push(vscode.languages.registerCompletionItemProvider(language, provider))
        }
    }

    return vscode.Disposable.from(...disposables);
}


export function activate(context: vscode.ExtensionContext) {
    const emoji = new EmojiProvider()
    const config = new Configuration()
    const provider = new EmojiCompletionProvider(emoji, config)

    let providerSub = registerProviders(provider, config)

    vscode.workspace.onDidChangeConfiguration(() => {
        config.updateConfiguration()
        providerSub.dispose()
        providerSub = registerProviders(provider, config)
    }, null, context.subscriptions)

    context.subscriptions.push(new DecoratorProvider(emoji, config))
}
