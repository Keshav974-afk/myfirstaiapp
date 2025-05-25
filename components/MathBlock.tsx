import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathBlockProps {
  formula: string;
  inline?: boolean;
}

export function MathBlock({ formula, inline = false }: MathBlockProps) {
  if (Platform.OS === 'web') {
    return inline ? (
      <InlineMath math={formula} />
    ) : (
      <BlockMath math={formula} />
    );
  }

  // For native platforms, use WebView with KaTeX
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <style>
          body {
            margin: 0;
            padding: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: ${inline ? '24px' : '48px'};
            background-color: transparent;
          }
          .math-container {
            display: ${inline ? 'inline-block' : 'block'};
            width: 100%;
            text-align: ${inline ? 'left' : 'center'};
          }
        </style>
      </head>
      <body>
        <div class="math-container" id="formula"></div>
        <script>
          katex.render(${JSON.stringify(formula)}, document.getElementById('formula'), {
            displayMode: ${!inline},
            throwOnError: false,
            output: 'html'
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, inline ? styles.inlineContainer : styles.blockContainer]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        androidLayerType="software"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  inlineContainer: {
    height: 24,
    marginVertical: 2,
  },
  blockContainer: {
    height: 48,
    marginVertical: 8,
  },
  webview: {
    backgroundColor: 'transparent',
  },
});