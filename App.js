import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {SafeAreaView, StyleSheet, BackHandler, View} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import AnimatedBottomBar from './AnimatedBottomBar';
import {WebView} from 'react-native-webview';

const getRefererLink = () =>
  `https://t.co/${Math.random().toString(36).slice(2)}`;
const MediumUrl = 'https://medium.com/';
const gestureConfig = {
  velocityThreshold: 0.1,
  directionalOffsetThreshold: 30,
};

const injectedJavaScript = `
  // issue https://stackoverflow.com/questions/56737182/react-native-webview-neterr-failed
  (function() {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
          registration.unregister();
      }
    });
  })();

  (function() {
    let url = location.href;
    if (document.body) {
      document.body.addEventListener('click', ()=>{
        requestAnimationFrame(()=>{
          console.log("location.href", location.href)
          if(url!==location.href){
            url = location.href
            var event = {
              type: "urlChanged",
              url: url
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(event));
          }
        });
      }, true);
    }
  })();
`;

class App extends React.Component {
  webViewRef = React.createRef();
  state = {
    source: {
      uri: MediumUrl,
      headers: {
        referer: getRefererLink(),
      },
    },
    prevUrl: '',
    isBackFromSPA: false,
    canWebViewGoBack: false,
    canWebViewGoForward: false,
    isBottomShown: true,
    progress: 0.0,
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this._handleBackButton,
    );
  }

  _handleBackButton = () => {
    const {isBackFromSPA, canWebViewGoBack, prevUrl} = this.state;
    if (isBackFromSPA) {
      this.setState({
        isBackFromSPA: false,
        source: {
          uri: prevUrl,
          headers: {
            referer: getRefererLink(),
          },
        },
      });
      return true;
    }
    if (canWebViewGoBack) {
      this.goBack();
      return true;
    } else {
      return false;
    }
  };

  goBack = () => {
    this.webViewRef.current.goBack();
  };

  goForward = () => {
    this.webViewRef.current.goForward();
  };

  _onNavigationStateChange = newNavState => {
    this.setState({
      canWebViewGoBack: newNavState.url !== MediumUrl && newNavState.canGoBack,
      canWebViewGoForward: newNavState.canGoForward,
    });
  };

  _onMessage = event => {
    const parsedEvent = JSON.parse(event.nativeEvent.data);

    this.webViewRef.current.stopLoading();

    this.setState({
      canWebViewGoBack: true,
      canWebViewGoForward: false,
      prevUrl: this.state.source.uri,
      source: {
        uri: parsedEvent.url,
        headers: {
          referer: getRefererLink(),
        },
      },
      isBackFromSPA: true,
    });

    this.webViewRef.current.reload();
  };

  _onSwipeUp = () => this.setState({isBottomShown: false});
  _onSwipeDown = () => this.setState({isBottomShown: true});

  _onLoadProgress = event => {
    this.setState({
      isBottomShown: true,
      progress: event.nativeEvent.progress,
    });
  };

  _onLoadStart = navState => {
    if (this.state.url !== navState.nativeEvent.url) {
      this.setState({
        source: {
          uri: navState.nativeEvent.url,
          headers: {
            referer: getRefererLink(),
          },
        },
      });
    }
  };

  render() {
    const {
      isBottomShown,
      progress,
      source,
      canWebViewGoBack,
      canWebViewGoForward,
    } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <GestureRecognizer
          onSwipeUp={this._onSwipeUp}
          onSwipeDown={this._onSwipeDown}
          config={gestureConfig}
          style={{flex: 1}}>
          <View style={{flex: 1}}>
            <WebView
              ref={this.webViewRef}
              originWhitelist={['*']}
              setSupportMultipleWindows={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              nativeConfig={{props: {webContentsDebuggingEnabled: true}}}
              source={source}
              referer={source.headers.referer}
              onLoadStart={this._onLoadStart}
              onNavigationStateChange={this._onNavigationStateChange}
              onLoadProgress={this._onLoadProgress}
              onMessage={this._onMessage}
              injectedJavaScript={injectedJavaScript}
            />
          </View>
          {isBottomShown && (
            <AnimatedBottomBar
              canGoForward={canWebViewGoForward}
              canGoBack={canWebViewGoBack}
              goBack={this.goBack}
              goForward={this.goForward}
              progress={progress}
              currentUrl={source.uri}
            />
          )}
        </GestureRecognizer>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default App;
