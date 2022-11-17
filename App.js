import { StyleSheet, Text, SafeAreaView, View, TouchableOpacity, Modal, Image } from 'react-native';
import { Camera } from 'expo-camera'
import { useEffect, useRef, useState } from 'react';
import { FontAwesome } from "@expo/vector-icons"


import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'

export default function App() {
  const camRef = useRef(null)
  const [type, setType] = useState(Camera.Constants.Type.back)
  const [hasPermission, setHasPermission] = useState(null)
  const [foto, setFoto] = useState(null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState()

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted");
    })();

    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      setHasPermission(status === "granted");
    })();

  }, []);

  if (hasPermission === false) {
    return <Text>Sem permissão de acesso</Text>;
  }

  async function tirarFoto() {
    if (camRef) {
      const data = await camRef.current.takePictureAsync()
      setFoto(data.uri);
      setOpen(true)



    }
  }

  async function salvarFoto() {
    const asset = await MediaLibrary.createAssetAsync(foto)
    await MediaLibrary.createAlbumAsync('Camera', asset, false)
      .then(() => {
        alert('Salvo com sucesso')
      })
      .catch((error) => {
        console.log(error.message)
      })
  }

  //Function assync for recognizeText for image capture
  const recognizeTextFromImage = async (path) => {
    try {
      const tesseractOptions = {};
      const recognizedText = await TesseractOcr.recognize(
        path,
        LANG_ENGLISH,
        tesseractOptions
      );
      setText(recognizedText);
    } catch (err) {
      console.error(err);
      setText("");
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={camRef}
        >
        <View style={styles.botoes}>
          <TouchableOpacity
            style={styles.change}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text>Alternar camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.change}
            onPress={tirarFoto}
          >
            <Text>Tirar foto</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      {foto && (
        <Modal animationType="slide" transparent={false} visible={open}>
          <View>
            <View style={{ margin: 10, flexDirection: 'row' }}>
              <TouchableOpacity style={{ margin: 10, backgroundColor: 'red' }} onPress={() => setOpen(false)}>
                <FontAwesome name="window-close" size={50} color="#fff"></FontAwesome>
              </TouchableOpacity>

              <TouchableOpacity style={{ margin: 10, backgroundColor: 'green' }} onPress={salvarFoto} >
                <FontAwesome name="save" size={50} color="#fff"></FontAwesome>
              </TouchableOpacity>

              <TouchableOpacity style={{ margin: 10, backgroundColor: 'blue' }} onPress={recognizeTextFromImage(foto.uri)} >
                <FontAwesome name="search" size={50} color="#fff"></FontAwesome>        
              </TouchableOpacity>
            </View>
            <Image style={styles.image} source={{ uri: foto }} />
            <Text> {text} </Text>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 50,
    marginHorizontal: 20
  },
  camera: {
    width: "100%",
    height: "100%"
  },
  botoes: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  change: {
    padding: 10,
    backgroundColor: 'red',
    width: 150,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: 20
  }
});
