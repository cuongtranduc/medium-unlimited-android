import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Clipboard,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import {Bar} from 'react-native-progress';

const componentH = Dimensions.get('screen').height * 0.08;
const componentW = Dimensions.get('screen').width;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 1,
    zIndex: 1,
    height: componentH,
  },
  animatedView: {
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.46,
    shadowRadius: 11.14,
    elevation: 17,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -componentH,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  promptText: {
    fontSize: 15,
  },
  row: {
    flex: 1,
    marginHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftRow: {
    flexDirection: 'row',
  },
});

class AnimatedBottomBar extends React.Component {
  _animatedBottomValue = new Animated.Value(0);

  componentDidMount() {
    this._startAnimation();
  }

  _startAnimation = () => {
    Animated.timing(this._animatedBottomValue, {
      toValue: -componentH,
      easing: Easing.linear,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  _handleCopy = () => {
    Clipboard.setString(this.props.currentUrl);
    ToastAndroid.showWithGravityAndOffset(
      'Copied to clipboard',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      0,
      80,
    );
  };

  render() {
    const {progress, canGoBack, goBack, canGoForward, goForward} = this.props;
    const roundProgress = Math.round(progress * 10) / 10;
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.animatedView,
            {
              transform: [
                {
                  translateY: this._animatedBottomValue,
                },
              ],
            },
          ]}>
          {roundProgress < 1 && (
            <Bar
              style={styles.progressBar}
              color="rgba(26, 137, 23, 0.5)"
              progress={roundProgress}
              borderWidth={0}
              height={2}
              width={componentW}
              borderRadius={0}
            />
          )}
          <View style={styles.row}>
            <View style={styles.leftRow}>
              <TouchableOpacity
                onPress={goBack}
                disabled={!canGoBack}
                style={{opacity: canGoBack ? 1 : 0.5}}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="arrow-left" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goForward}
                disabled={!canGoForward}
                style={{opacity: canGoForward ? 1 : 0.5}}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon
                  style={{
                    marginLeft: 45,
                  }}
                  name="arrow-right"
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              onPress={this._handleCopy}>
              <Icon name="content-copy" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }
}

export default AnimatedBottomBar;
