import React from "react";
import "./ImageList.scss";

class ImageList extends React.Component {

  // 최대 10개까지만 이미지 보이게 하기
  render() {
    return (
      <div className="ImageList">
        {this.props.img_list !== undefined && (
          <>
            <div className="thumbnail">
              <div id="square" className="centered">
                <img
                  alt="main_img"
                  className="img"
                  src={this.props.img_list}
                  onClick={() => {
                    window.open(this.props.img_list);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default ImageList;
