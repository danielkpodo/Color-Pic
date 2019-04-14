import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ChromePicker } from 'react-color';
import { Button, Modal, Icon, Input, Grid, Segment } from 'semantic-ui-react';
import { updateColorPalette } from '../actions/MyPaletteAPI';
import { sendPositionInfo } from '../actions';
import { sendSelectedColor } from '../actions';
import { sendColorInfo } from '../actions';
import { clearPosition } from '../actions';
import { sendAlphaInfo } from '../actions';
import { getColors } from '../actions/MyPaletteAPI';
import EditModalColorInfo from './EditModalColorInfo';

class EditModal extends Component {
  state = {
    open: false,
    title: '',
    selectedSet: [],
    hexInput:''
  };

  handleTitleInput(event) {
    this.setState({
      title: event.target.value
    });
  }

  handleOnClickSquare(color, index, alpha) {
    this.setState({
      hexInput: color
    });
    this.props.sendSelectedColor(color);
    this.props.sendColorInfo(color, alpha);
    this.props.sendPositionInfo(index);
  }

  handleChange = (color) => {
    let colorPalette = this.state.selectedSet;
    // create new color object
    let newColor = {
      hexColor: color.hex.toUpperCase(),
      alpha: color.rgb.a
    };
    // update new item in color array
    colorPalette[this.props.position] = newColor
    // // set new color square in local state
    this.setState({
      selectedSet: colorPalette,
      hexInput: color.hex.toUpperCase()
    })
    // update color info in display
    this.props.sendColorInfo(color.hex.toUpperCase());
    this.props.sendSelectedColor(color.hex.toUpperCase());
    this.props.sendAlphaInfo(color.rgb.a);
  }

  renderColorPicker() {
    return (
      <ChromePicker
        className="chrome-picker"
        style={{ marginRight: 4 + 'em' }}
        color={{
          r: this.props.R,
          g: this.props.G,
          b: this.props.B,
          a: this.props.alpha
        }}
        onChangeComplete={this.handleChange}
      />
    );
  }

  renderOneColorSet() {
    const colorSet = this.state.selectedSet.map((color, index) =>
      <div className="color-square-container" key={color.hexColor}>
        <div
          className="color-square"
          onClick={() => this.handleOnClickSquare(color.hexColor, index, color.alpha)}
          style={{
            backgroundColor: color.hexColor,
            opacity: color.alpha,
            cursor: 'pointer'
          }}
        />
        <div
          style={this.renderCarot(index)}
          className="carot-container"
        >
          <Icon size="big" name="caret up" />
        </div>
      </div>
     );
     return colorSet;
  }

  renderCarot(index) {
    if (index === this.props.position) {
      return {
        color: 'black'
      };
    } else {
      return {
        color: 'white'
      };
    }
  }

  hexColorOnChange(event) {
    // only use upper case and trim white space
    const newHexColor = event.target.value.toUpperCase().trim();
    // Do not update state if more than 7 total characters
    if(newHexColor.length <= 7) {
      this.setState({
        hexInput: newHexColor
      });
    }
    //if hexcolor has all 7 characters and includes # as the first character
    if (newHexColor.length === 7 && newHexColor[0] === '#') {
      let colorPalette = this.props.selectedSet;
      let newColor = {
        hexColor: newHexColor,
        alpha: this.props.a
      };
      // update new item in color array
      colorPalette[this.props.position] = newColor
      // update color info in display
      this.props.sendColorInfo(newHexColor);
      this.props.sendSelectedColor(newHexColor);
      this.props.sendAlphaInfo(this.props.a);
    }
  }

  closeConfigShow = (closeOnEscape, closeOnDimmerClick) => () => {
    const position = this.props.colorPosition;
    this.setState({
      closeOnEscape,
      closeOnDimmerClick,
      open: true,
      // send info to local state when modal opens
      title: this.props.data[position].title,
      selectedSet: this.props.data[position].colors,
      hexInput: this.props.data[position].colors[0].hexColor
    });
    // send color info for first square when model opens
    this.props.sendColorInfo(this.props.data[position].colors[0].hexColor, this.props.data[position].colors[0].alpha);
  }

  cancel = () => {
    // set original info when modal is canceled
    const position = this.props.colorPosition;
    this.setState({
      open: false,
      title: this.props.data[position].title,
      hexInput: this.props.data[position].colors[0].hexColor,
      selectedSet: this.props.data[position].colors
    });
    this.props.clearPosition();
    // reset info from DB
    this.props.getColors();
  }

  handleConfirm = () => {
    this.setState({
      open: false,
    });
    const UpdateData = {
      title: this.state.title,
      colors: this.state.selectedSet
    };
    this.props.updateColorPalette(this.props.objectID, UpdateData);
    this.props.clearPosition();
  }

  render() {
    const { open, closeOnEscape, closeOnDimmerClick, title, hexInput, selectedSet } = this.state

    return (
      <div className="edit-modal">
        <Icon
          size='large'
          onClick={this.closeConfigShow(false, true)}
          name="edit"
        />
        <Modal
          open={open}
          closeOnEscape={closeOnEscape}
          closeOnDimmerClick={closeOnDimmerClick}
          onClose={this.close}
        >
          <Modal.Header>Edit Palette</Modal.Header>
          <Modal.Content>
            <Input
              className="savepalette-modal-input"
              label="Title"
              value={title}
              onChange={event => this.handleTitleInput(event)}
              placeholder='Edit Palette Name...'
            />
            <div className="colors-render">
              {this.renderOneColorSet()}
            </div>
            <Grid stackable columns={2}>
              <Grid.Column width={10}>
                <Segment>
                  {this.renderColorPicker()}
                </Segment>
              </Grid.Column>
              <Grid.Column width={6}>
                <Segment>
                  <EditModalColorInfo
                    hexInput={hexInput}
                    hexColorOnChange={event => this.hexColorOnChange(event)}
                    selectedSet={selectedSet}
                  />
                </Segment>
              </Grid.Column>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.cancel}>
              Cancel
            </Button>
            <Button
              onClick={this.handleConfirm}
              color='blue'
            >
              Confirm
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    data: state.myPalettes.Data,
    position: state.colorInfo.position,
    hexColor: state.colorInfo.hexColor,
    R: state.colorInfo.R,
    G: state.colorInfo.G,
    B: state.colorInfo.B,
    alpha: state.colorInfo.alpha,
  };
};

export default connect(mapStateToProps, {
  updateColorPalette,
  sendPositionInfo,
  sendSelectedColor,
  sendColorInfo,
  sendAlphaInfo,
  clearPosition,
  getColors
})(EditModal);