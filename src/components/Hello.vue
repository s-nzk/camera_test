

<template>
  <div id="view" class="phone-viewport">
    
    <md-toolbar id="toolbar">
      <h2 class="md-title" style="flex: 1">ブラウザカメラアプリ</h2>
    </md-toolbar>
    <md-list id="list">
        <md-list-item style="width:100%">
          <div v-on:click="click_photo_panel" style="width:100%">
            <md-ink-ripple />
            <md-icon class="md-size-4x md-primary">photo_camera</md-icon>
            <span>荷姿を撮影する</span>
            <input id="photo" type="file" v-on:change="take_photo" style="display:none">
          </div>
        </md-list-item>
      
      
        <md-list-item style="width:100%">
          <div v-on:click="click_qr_panel" style="width:100%">
            <md-ink-ripple />
            <md-icon class="md-size-4x md-primary">add_a_photo</md-icon>
            <span>QRコードを読み取る</span>
            <input id="qr" type="file" v-on:change="take_qr" style="display:none">
          </div>
        </md-list-item>
      
      
        <md-list-item style="width:100%">
          <div v-on:click="get_image" style="width:100%">
            <md-ink-ripple />
            <md-icon class="md-size-4x md-primary">view_list</md-icon>
            <span>撮影した写真を確認する</span>
          </div>
        </md-list-item>
      
      
    </md-list>
    
    <div id="jssor_1" style="margin:0 auto; position:relative;width:250px;height:250px;overflow:hidden;">
      <div id="jssor_1_slides" data-u="slides" style="position:relative;cursor:default;width:250px;height:250px;overflow:hidden">
        <div v-for="image in image_list">
          <img :src="imageURL(image)"/>
        </div>
      </div>
    </div>

    <md-dialog md-open-from="#custom" md-close-to="#custom" ref="preview">
      <md-dialog-title>プレビュー</md-dialog-title>
      <md-dialog-content>
        <img :src="image_src"></img>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" v-on:click.native="close_preview()">キャンセル
          <md-ink-ripple />
        </md-button>
        <md-button class="md-primary" v-on:click.native="upload()">アップロード
          <md-ink-ripple />
        </md-button>
      </md-dialog-actions>
    </md-dialog>


    <md-snackbar :md-position="'top'+' '+'center'" ref="snackbar" :md-duration="6000">
      <span>{{ message }}</span>
    </md-snackbar>

  </div>
</template>


<script>
/* global QrCode */
/* global $JssorSlider$ */

const URL = '/'
export default {
  name: 'hello',
  data () {
    return {
      image_src: '',
      message: '',
      image_list: [],
      duration: 6000
    }
  },
  methods: {
    // 荷姿を撮影するパネル押下
    click_photo_panel () {
      console.log(this)
      let photo = document.getElementById('photo')
      photo.click()
    },
    // 写真を撮影した後の処理
    take_photo (e) {
      let file = e.target.files && e.target.files[0]
      if (file != null) {
        let reader = new FileReader()
        reader.onload = () => {
          makeSmall(reader.result, (small) => {
            // リサイズ結果の反映
            console.log(small)
            this.image_src = small
            this.$refs.preview.open()
          })
        }
        reader.readAsDataURL(file)
      }
    },
    // 写真プレビュー閉じる
    close_preview () {
      this.$refs.preview.close()
    },
    // 写真アップロード
    upload () {
      console.log('upload')
      let form = new FormData()
      form.append('file', this.image_src)
      fetch(URL + 'upload', {
        method: 'POST',
        body: form
      })
      .then((response) => {
        console.log(response)
        if (response.status === 200) {
          this.message = 'アップロード成功しました'
        } else {
          this.message = 'アップロード失敗'
        }
        this.$refs.preview.close()
        this.duration = 6000
        this.$refs.snackbar.open()
      })
    },
    // QRコードを読み取る
    click_qr_panel () {
      let qr = document.getElementById('qr')
      qr.click()
    },

    // QRコード撮影後
    take_qr (e) {
      let file = e.target.files && e.target.files[0]
      if (file != null) {
        let reader = new FileReader()
        reader.onload = () => {
          makeSmall(reader.result, (small) => {
            // QrCode読み取り
            let qr = new QrCode()
            qr.callback = (result, err) => {
              if (err) {
                this.message = err
              } else {
                this.message = result
              }
              this.$refs.snackbar.open()
            }
            qr.decode(small)
          })
        }
        reader.readAsDataURL(file)
      }
    },
    get_image () {
      fetch(URL + 'imagelist')
      .then((response) => {
        response.json().then((data) => {
          this.image_list = data
          setTimeout(() => {
            let viewHeight = document.getElementById('view').offsetHeight
            let viewWidth = document.getElementById('view').offsetWidth
            let toolbarHeight = document.getElementById('toolbar').offsetHeight
            let listHeight = document.getElementById('list').offsetHeight
            let height = viewHeight - toolbarHeight - listHeight
            let w
            if (height > viewWidth) {
              w = viewWidth
            } else {
              w = height
            }
            document.getElementById('jssor_1').style.height = `${w}px`
            document.getElementById('jssor_1_slides').style.height = `${w}px`
            document.getElementById('jssor_1').style.width = `${w}px`
            document.getElementById('jssor_1_slides').style.width = `${w}px`
            let x = new $JssorSlider$('jssor_1', {$FillMode: 1})
            console.log(x)
          })
        })
      })
    },
    imageURL (name) {
      return URL + 'static/uploads/' + name
    }
  }
}

// 写真リサイズ処理
let makeSmall = (large, callback) => {
  let scale = 0.1 // 10%へリサイズ
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  let image = new Image()
  image.src = large

  image.onload = (event) => {
    let dstWidth = image.width * scale
    let dstHeight = image.height * scale
    canvas.width = dstWidth
    canvas.height = dstHeight
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, dstWidth, dstHeight)
    callback(canvas.toDataURL())
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
