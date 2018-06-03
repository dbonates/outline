// @flow
import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import Dropzone from 'react-dropzone';

import LoadingIndicator from 'components/LoadingIndicator';
import Flex from 'shared/components/Flex';
import Modal from 'components/Modal';
import Button from 'components/Button';
import AvatarEditor from 'react-avatar-editor';
import { uploadFile, dataUrlToBlob } from 'utils/uploadFile';

type Props = {
  children?: React.Node,
  onSuccess: string => *,
  onError: string => *,
  submitText: string,
  borderRadius: number,
};

@observer
class DropToImport extends React.Component<Props> {
  @observable isUploading: boolean = false;
  @observable isCropping: boolean = false;
  @observable zoom: number = 1;
  file: File;
  avatarEditorRef: AvatarEditor;

  static defaultProps = {
    submitText: 'Crop Picture',
    borderRadius: 150,
  };

  onDropAccepted = async (files: File[]) => {
    this.isCropping = true;
    this.file = files[0];
  };

  handleCrop = async () => {
    const canvas = this.avatarEditorRef.getImage();
    const imageBlob = dataUrlToBlob(canvas.toDataURL());
    try {
      const asset = await uploadFile(imageBlob, { name: this.file.name });
      this.props.onSuccess(asset.url);
    } catch (err) {
      this.props.onError(err.message);
    } finally {
      this.isUploading = false;
      this.isCropping = false;
    }
  };

  handleClose = () => {
    this.isUploading = false;
    this.isCropping = false;
  };

  handleZoom = (event: SyntheticDragEvent<*>) => {
    let target = event.target;
    if (target instanceof HTMLInputElement) {
      this.zoom = parseFloat(target.value);
    }
  };

  renderCropping() {
    const { submitText } = this.props;

    return (
      <Modal isOpen onRequestClose={this.handleClose} title="">
        <Flex auto column align="center" justify="center">
          <AvatarEditorContainer>
            <AvatarEditor
              ref={ref => (this.avatarEditorRef = ref)}
              image={this.file}
              width={250}
              height={250}
              border={25}
              borderRadius={this.props.borderRadius}
              color={[255, 255, 255, 0.6]} // RGBA
              scale={this.zoom}
              rotate={0}
            />
          </AvatarEditorContainer>
          <RangeInput
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            defaultValue="1"
            onChange={this.handleZoom}
          />
          {this.isUploading && <LoadingIndicator />}
          <CropButton onClick={this.handleCrop} disabled={this.isUploading}>
            {submitText}
          </CropButton>
        </Flex>
      </Modal>
    );
  }

  render() {
    if (this.isCropping) {
      return this.renderCropping();
    }

    return (
      <Dropzone
        accept="image/png, image/jpeg"
        onDropAccepted={this.onDropAccepted}
        style={{}}
        disablePreview
        onSuccess={this.props.onSuccess}
        onError={this.props.onError}
      >
        {this.props.children}
      </Dropzone>
    );
  }
}

const AvatarEditorContainer = styled(Flex)`
  margin-bottom: 30px;
`;

const RangeInput = styled.input`
  display: block;
  width: 300px;
  margin-bottom: 30px;
  height: 4px;
  cursor: pointer;
  color: inherit;
  border-radius: 99999px;
  background-color: #dee1e3;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: black;
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`;

const CropButton = styled(Button)`
  width: 300px;
`;

export default DropToImport;
