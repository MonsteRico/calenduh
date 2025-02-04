import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useSession } from '../hooks/context';
import * as AppleAuthentication from 'expo-apple-authentication';
export default function SignIn() {
    const { setAppSession } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{color:"#fac806", fontSize:45}}>Sign In</Text>
      <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          style={{width:300, height:50}}
          onPress={async () => {
              try {
                  const credential: AppleAuthentication.AppleAuthenticationCredential = await AppleAuthentication.signInAsync({
                      requestedScopes: [
                          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                          AppleAuthentication.AppleAuthenticationScope.EMAIL,
                      ],
                  });
                  const session = {user:"abc"} // would be an api call with the credential
                  // call will error if credential is not valid sending to catch otherwise will return session data
                  // api checks if credential is a valid apple jwt'
                    // we set our login context to true and set the session data
                        setAppSession(session)
                  // if not valid, api returns error
              } catch (error : any) {
                  if (error.code === 'ERR_CANCELED') {
                      console.error('Continue was cancelled.');
                  } else {
                      console.error(error.message);
                  }
              }
          }}
      />
    </View>
  );
}
