use web_sys::{Blob, Url};
use js_sys::{Array, JsString, Promise, Uint8Array, Function, Object};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::{future_to_promise, JsFuture};

async fn await_js_func(res: Result<JsValue, JsValue>) {
    let promise: Promise = res.unwrap().into();
    let future = JsFuture::from(promise);
    let _result = future.await;
}

#[no_mangle]
#[wasm_bindgen]
pub async fn parse(this: Object, gif: Uint8Array, src: JsString, load_images: Function, callback: Function) -> Promise{
    future_to_promise( async move{
        //setup values
        let gif = gif.to_vec();
        let src: String = src.into();
        let mut pos: usize = 0;
        let (mut gif_header, mut graphic_control, mut image_data): (&[u8], &[u8], &[u8]) = (&[],&[],&[]);

        if gif[0] == 0x47 && gif[1] == 0x49 && gif[2] == 0x46 && // 'GIF'
            gif[3] == 0x38 && gif[4] == 0x39 && gif[5] == 0x61 { // '89a'

            pos += 13 + !((gif[10] & 0x80) == 0) as usize * usize::pow(2, ((gif[10] & 0x07) + 1) as u32) * 3;
            gif_header = &gif[0..pos];

            while gif[pos] != 0 && gif[pos] != 0x3b {
                let offset = pos;
                let block_id = gif[pos];

                if block_id == 0x21 {
                    pos += 1;
                    let label = gif[pos];
                    if [0x01, 0xfe, 0xf9, 0xff].contains(&label) {
                        pos += 1;
                        while gif.len() > pos && gif[pos] != 0 {
                            pos += 1 + gif[pos] as usize;
                        }

                        if label == 0xf9 {graphic_control = &gif[offset..pos + 1]; }
                    } else {
                        return Err(JsValue::from("No graphical controls found."));
                    }
                }
                else if block_id == 0x2c {
                    pos += 9;
                    pos += 1 + !((gif[pos] & 0x80) == 0) as usize * usize::pow(2, ((gif[pos] & 0x07) + 1) as u32) * 3;

                    pos += 1;
                    while gif[pos] != 0 && gif.len() > pos {
                        pos += 1 + gif[pos] as usize;
                    }

                    image_data = &gif[offset..pos + 1];
                    let (js_gif_header, js_graphic_control, js_image_data) = (
                        &JsValue::from(Uint8Array::from(&gif_header[..])),
                        &JsValue::from(Uint8Array::from(&graphic_control[..])),
                        &JsValue::from(Uint8Array::from(&image_data[..])));

                    let mut js_blob_data = Array::new();
                    Array::push(&mut js_blob_data, &js_gif_header);
                    Array::push(&mut js_blob_data, &js_graphic_control);
                    Array::push(&mut js_blob_data, &js_image_data);

                    let media_source = Blob::new_with_buffer_source_sequence(&JsValue::from(js_blob_data)).unwrap();

                    await_js_func(load_images.call2(&this, &JsValue::from_str(&Url::create_object_url_with_blob(&media_source).unwrap()), &JsValue::from_str(&src))).await;
                }
                else {
                    return Err(JsValue::from("Couldn't extract images"));
                }

                pos += 1;
                if !(gif.len() > pos && gif[pos] != 0 && gif[pos] != 0x3b as u8) {
                    callback.call1(&this, &JsValue::from(0));
                    return Ok(JsValue::from(0));
                }
            }
        }
        else {
            return Err(JsValue::from("File should be type of GIF"));
        }
        return Ok(JsValue::from(0));
    })
}