import React, { useState, useEffect, useContext } from 'react';
import {
  Anchor,
  Heading,
  TextInput,
  Form,
  FormField,
  Box,
  Text,
  Button,
  CheckBoxGroup,
} from 'grommet';
import { HuePicker } from 'react-color';

const pluralize = require('pluralize');

import { StateContext } from '../../LayoutContainer';
import Loader from '../../UIComponents/Loader';
import Template from '../../UIComponents/Template';
import ListMenu from '../../UIComponents/ListMenu';
import { message, Alert } from '../../UIComponents/message';
import ConfirmModal from '../../UIComponents/ConfirmModal';
import Tag from '../../UIComponents/Tag';
import { call, resizeImage, uploadImage } from '../../functions';
import { adminMenu } from '../../constants/general';
import SettingsForm from './SettingsForm';
import FileDropper from '../../UIComponents/FileDropper';

const specialCh = /[!@#$%^&*()/\s/_+\=\[\]{};':"\\|,.<>\/?]+/;

const colorModel = {
  hsl: {
    h: 0,
    s: 0.8,
    l: 0.2,
    a: 1,
  },
};

menuItems = ['activities', 'calendar', 'processes', 'works', 'info'];

const Settings = ({ history }) => {
  const [localSettings, setLocalSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [formAltered, setFormAltered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  const [mainColor, setMainColor] = useState(colorModel);

  const { currentUser, currentHost, role } = useContext(StateContext);

  useEffect(() => {
    currentHost && setLocalSettings(currentHost.settings);
    getCategories();
    setLoading(false);
    currentHost &&
      currentHost.settings.mainColor &&
      setMainColor(currentHost.settings.mainColor);
  }, []);

  const getCategories = async () => {
    try {
      const latestCategories = await call('getCategories');
      setCategories(latestCategories);
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    }
  };

  const handleFormChange = (newSettings) => {
    setFormAltered(true);
    setLocalSettings(newSettings);
  };

  const handleFormSubmit = async () => {
    if (!currentUser || role !== 'admin') {
      message.error('This is not allowed');
      return;
    }

    if (!formAltered) {
      message.info('You have not changed any value');
      return;
    }

    setLoading(true);
    try {
      await call('updateHostSettings', localSettings);
      message.success('Settings are successfully saved');
      setLoading(false);
    } catch (error) {
      message.error(error.reason);
      setLoading(false);
    }
  };

  const addNewCategory = async () => {
    try {
      await call('addNewCategory', categoryInput.toLowerCase(), 'work');
      getCategories();
      setCategoryInput('');
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    }
  };

  const removeCategory = async (categoryId) => {
    try {
      await call('removeCategory', categoryId);
      getCategories();
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!currentUser || role !== 'admin') {
    return <Alert>You are not allowed to be here</Alert>;
  }

  const handleCategoryInputChange = (value) => {
    if (specialCh.test(value)) {
      message.error('Special characters not allowed', 2);
      return;
    } else {
      setCategoryInput(value.toUpperCase());
    }
  };

  const setUploadableImage = (files) => {
    setUploading(true);
    if (files.length > 1) {
      message.error('Please drop only one file at a time.');
      return;
    }
    const uploadableImage = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(uploadableImage);
    reader.addEventListener(
      'load',
      () => {
        setLocalImage({
          uploadableImage,
          uploadableImageLocal: reader.result,
        });
      },
      false
    );
  };

  const uploadLogo = async () => {
    try {
      // const resizedImage = await resizeImage(localImage.uploadableImage, 500);
      const uploadedImage = await uploadImage(
        localImage.uploadableImage,
        'hostLogoUpload'
      );
      await call('assignHostLogo', uploadedImage);
      message.success('Your logo is successfully set');
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      setUploading(false);
    }
  };

  const confirmMainColor = async () => {
    try {
      await call('setMainColor', mainColor);
      message.success('Main color is successfully set');
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
    }
  };

  const handleSetMainColor = (color) => {
    const newMainColor = {
      hsl: {
        h: color.hsl.h.toFixed(0),
        s: 0.8,
        l: 0.35,
      },
    };
    setMainColor(newMainColor);
  };

  const pathname = history && history.location.pathname;
  const settings = currentHost && currentHost.settings;

  const handleMenuItemCheck = ({ value, option }) => {
    console.log(value, option);
  };

  return (
    <Template
      heading="Settings"
      leftContent={
        <Box pad="medium">
          <ListMenu list={adminMenu}>
            {(datum) => (
              <Anchor
                onClick={() => history.push(datum.value)}
                key={datum.value}
                label={
                  <Text weight={pathname === datum.value ? 'bold' : 'normal'}>
                    {datum.label}
                  </Text>
                }
              />
            )}
          </ListMenu>
        </Box>
      }
    >
      <Box pad="medium" background="white" margin={{ bottom: 'large' }}>
        <Heading level={3}>Logo</Heading>
        <Text margin={{ bottom: 'medium' }}>Upload Your Logo</Text>
        <Box width="small" alignSelf="center">
          <FileDropper
            uploadableImageLocal={localImage && localImage.uploadableImageLocal}
            imageUrl={currentHost && currentHost.logo}
            setUploadableImage={setUploadableImage}
          />
        </Box>
        {localImage && localImage.uploadableImageLocal && (
          <Box alignSelf="center" pad="medium">
            <Button onClick={() => uploadLogo()} label="Confirm" />
          </Box>
        )}
      </Box>

      <Box pad="medium" background="white" margin={{ bottom: 'large' }}>
        <Heading level={3}>Main Color</Heading>
        <Text margin={{ bottom: 'medium' }}>
          Pick the Main Color for Your Web Presence
        </Text>
        <Box direction="row" justify="between" align="center">
          <HuePicker color={mainColor} onChangeComplete={handleSetMainColor} />
          <Box
            flex={{ grow: 0 }}
            width="50px"
            height="50px"
            background={`hsl(${mainColor.hsl.h}, 80%, 35%)`}
            style={{ borderRadius: '50%' }}
          />
        </Box>

        <Box alignSelf="center" pad="medium">
          <Button
            disabled={settings && mainColor === settings.mainColor}
            onClick={() => confirmMainColor()}
            label="Confirm"
          />
        </Box>
      </Box>

      <Box pad="medium" background="white" margin={{ bottom: 'large' }}>
        <Heading level={3}>Menu</Heading>
        <Box margin={{ bottom: 'large' }}>
          <Text weight="bold">Visibility</Text>
          <Text margin={{ bottom: 'medium' }} size="small">
            Check/uncheck items to compose the main menu
          </Text>

          <Form>
            <CheckBoxGroup
              options={menuItems.map((item) => item.toUpperCase())}
              onChange={handleMenuItemCheck}
              value={currentHost && currentHost.menuItems}
            />
          </Form>
        </Box>

        <Box margin={{ bottom: 'large' }}>
          <Text weight="bold">Order</Text>
          <Text margin={{ bottom: 'medium' }} size="small">
            Reorder items if you want to change the menu display order
          </Text>
        </Box>
      </Box>

      <Box pad="medium" background="white" margin={{ bottom: 'large' }}>
        <Heading level={3}>Organisation</Heading>
        <Text margin={{ bottom: 'medium' }}>
          Add/Edit Information About your Organisation
        </Text>
        <SettingsForm
          value={localSettings}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          formAltered={formAltered}
        />
      </Box>

      <Box pad="medium" background="white" margin={{ bottom: 'large' }}>
        <Heading level={3}>Work Categories</Heading>
        <Text>You can set categories for work entries here</Text>
        <Box pad="small" direction="row" gap="small" wrap justify="center">
          {categories.map((category) => (
            <Tag
              key={category.label}
              label={category.label.toUpperCase()}
              background={category.color}
              removable
              onRemove={() => removeCategory(category._id)}
              margin={{ bottom: 'small' }}
            />
          ))}
        </Box>
        <Form onSubmit={() => addNewCategory()}>
          <Box>
            <Box direction="row" gap="small" width="medium" alignSelf="center">
              <TextInput
                size="small"
                plain={false}
                value={categoryInput}
                placeholder="PAJAMAS"
                onChange={(event) =>
                  handleCategoryInputChange(event.target.value)
                }
              />
              <Button type="submit" label="Add" />
            </Box>
          </Box>
        </Form>
      </Box>

      <Box pad="medium" background="white" margin={{ bottom: 'medium' }}>
        {/* <Form
          value={settings}
          onChange={this.handleFormChange}
          onSubmit={this.handleFormSubmit}
        >
          <Box width="medium" margin={{ bottom: 'medium' }}>
            <FormField
              label="Process"
              size="small"
              help={
                <Text size="small">
                  Type a name if you want to replace{' '}
                  <b>
                    <code>process</code>
                  </b>{' '}
                  with something else. Note that only one word is allowed
                </Text>
              }
            >
              <TextInput plain={false} name="process" placeholder="group" />
            </FormField>

            <Text size="small" margin={{ left: 'small' }}>
              {settings.process && (
                <span>
                  <b>
                    <code>{pluralize(settings.process)}</code>
                  </b>{' '}
                  will be plural version
                </span>
              )}
            </Text>
          </Box>

          <Box width="medium" margin={{ bottom: 'medium' }}>
            <FormField
              label="Work"
              size="small"
              help={
                <Text size="small">
                  Type a name if you want to replace{' '}
                  <b>
                    <code>work</code>
                  </b>{' '}
                  with something else. Note that only one word is allowed
                </Text>
              }
            >
              <TextInput plain={false} name="work" placeholder="work" />
            </FormField>
          </Box>

          <Box width="medium" margin={{ bottom: 'medium' }}>
            <FormField
              label="Info"
              size="small"
              help={
                <Text size="small">
                  Type a name if you want to replace{' '}
                  <b>
                    <code>Info</code>
                  </b>{' '}
                  with something else. Note that only one word is allowed
                </Text>
              }
            >
              <TextInput plain={false} name="info" placeholder="About" />
            </FormField>

            <Text size="small" margin={{ left: 'small' }}>
              {settings.info && (
                <span>
                  <b>
                    <code>{pluralize(settings.info)}</code>
                  </b>{' '}
                  will be plural version
                </span>
              )}
            </Text>
          </Box>

          <Box direction="row" justify="end" pad="small">
            <Button type="submit" primary label="Confirm" />
          </Box>
        </Form> */}
      </Box>

      {/* <ConfirmModal
        visible={isDeleteModalOn}
        onConfirm={this.handleRemoveCategory}
        onCancel={this.closeDeleteModal}
        title="Confirm Delete"
      >
        Are you sure you want to delete this category?
      </ConfirmModal> */}
    </Template>
  );
};

export default Settings;
