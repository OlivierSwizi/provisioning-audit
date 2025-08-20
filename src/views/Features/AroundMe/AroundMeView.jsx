import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Button, Input, Card, message } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { useGlyphModal } from "@/components/modal/GlyphSelectModal/GlyphSelectModal";
import ManagedList from "@/components/ManagedList";
import Glyph from "@/common/Glyph";
import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useEditPlaceModal } from "./EditPlaceModal";
import MapImage from "@/components/MapImage";
import logger from "@/logger";

const { Text } = Typography;

const AroundMe = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();
  const [editPlace, EditPlaceModal] = useEditPlaceModal();

  const [siteId, setSiteId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectGlyph, GlyphSelectModal] = useGlyphModal();

  useEffect(() => {
    if (!appId || !siteId) return;

    const doIt = async () => {
      try {
        await dispatch(startWorking());

        const config = await api.features.getAroundMeConfig(siteId);
        const categories = config.map((item, idx) =>
          Object.assign({
            id: idx + 1,
            title: item.title || "",
            icon: item.icon || "",
            places: (item.places || []).map((place, idxP) =>
              Object.assign({
                id: idxP + 1,
                title: place.title || "",
                subtitle: place.subtitle || "",
                website: place.website || "",
                address: place.address || "",
                phone: place.phone || "",
                lat: place.lat,
                lon: place.lon,
              }),
            ),
          }),
        );
        setCategories(categories);
        setSelectedCategory(config[0]);
      } catch (e) {
        logger.error(e);
        message.error(t("load-error"));
      } finally {
        await dispatch(stopWorking());
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const handleSave = async () => {
    try {
      await dispatch(startWorking());
      const config = await api.features.saveAroundMeConfig(siteId, categories);
      const newCategories = config.map((item, idx) =>
        Object.assign({
          id: idx + 1,
          title: item.title || "",
          icon: item.icon || "",
          places: (item.places || []).map((place, idxP) =>
            Object.assign({
              id: idxP + 1,
              title: place.title || "",
              subtitle: place.subtitle || "",
              website: place.website || "",
              address: place.address || "",
              phone: place.phone || "",
              lat: place.lat,
              lon: place.lon,
            }),
          ),
        }),
      );
      setCategories(newCategories);
      setSelectedCategory(config[0]);
      message.success(t("save-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("save-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const handleAddCategory = async (title) => {
    const newCategory = {
      id: categories.length + 1,
      title,
      icon: "",
      places: [],
    };

    setCategories([...categories, newCategory]);
  };

  const handleAddPlace = async (title) => {
    const newPlace = {
      id: selectedCategory.places.length + 1,
      title,
      subtitle: "",
      website: "",
      address: "",
      phone: "",
      lat: 0,
      lon: 0,
    };

    const currentCategory = selectedCategory;
    currentCategory.places = [...selectedCategory.places, newPlace];
    let currentCategories = categories;
    currentCategories[currentCategory.id - 1] = currentCategory;
    setCategories(currentCategories);
    setSelectedCategory({ ...selectedCategory, places: currentCategory.places });
  };

  const handleRemovePlace = (item) => {
    let currentPlaces = selectedCategory.places;
    currentPlaces = currentPlaces.filter((place) => place.id !== item.id);
    let currentCategory = selectedCategory;
    currentCategory.places = currentPlaces;
    let currentCategories = categories;
    currentCategories[currentCategory.id - 1] = currentCategory;
    setCategories(currentCategories);
    setSelectedCategory({ ...selectedCategory, places: currentCategory.places });
  };

  const handleUpdateCategory = (item) => {
    let currentCategories = categories;
    currentCategories[item.id - 1] = item;
    setCategories(currentCategories);
    setSelectedCategory(item);
  };

  const handleUpdatePlace = (item) => {
    let currentPlaces = selectedCategory.places;
    let placeIndex = currentPlaces.findIndex((place) => place.id === item.id);
    currentPlaces[placeIndex] = item;

    let currentCategory = selectedCategory;
    currentCategory.places = currentPlaces;
    let currentCategories = categories;
    currentCategories[currentCategory.id - 1] = currentCategory;
    setCategories(currentCategories);
    setSelectedCategory({ ...selectedCategory, places: currentPlaces });
  };

  const handleUpdateIcon = async () => {
    let newIcon = await selectGlyph();
    if (!newIcon) return;
    let currentCategory = selectedCategory;
    currentCategory.icon = newIcon;
    handleUpdateCategory(currentCategory);
  };

  const handlEditPlace = async (item) => {
    let newValues = await editPlace(item);
    handleUpdatePlace({ id: item.id, ...newValues });
  };

  const ReadOnlyPlace = ({ place }) => {
    const Property = ({ place, property }) => (
      <Row style={{ width: "100%", marginBottom: "5px" }} align="middle" justify="center">
        <Col span={10}>
          <Text>{t(`am-place-${property}`)}</Text>
        </Col>
        <Col span={14}>
          <Input autoComplete="off" value={place[property] || ""} disabled={true} />
        </Col>
      </Row>
    );
    return (
      <>
        <Property place={place} property="title" />
        <Property place={place} property="subtitle" />
        <Property place={place} property="phone" />
        <Property place={place} property="website" />

        <Row style={{ width: "100%", marginTop: "10px" }} align="middle" justify="center">
          <Col span={10}>
            <Text>{t("am-place-position")}</Text>
          </Col>
          <Col span={10}>
            <Text>{place.address}</Text>
          </Col>
          <Col span={4} style={{ height: "150px" }}>
            <MapImage
              style={{ height: "100%" }}
              value={{
                address: place.address,
                lon: place.lon,
                lat: place.lat,
              }}
            />
          </Col>
        </Row>
      </>
    );
  };

  const Places = () => (
    <>
      <Row style={{ width: "100%" }}>
        <Card style={{ width: "100%", marginBottom: "25px" }} bordered={false}>
          <Row style={{ width: "100%", marginBottom: "15px" }}>
            <Col span={8}>
              <Text>{t("am-category-title")}</Text>
            </Col>
            <Col span={12}>
              <Input autoComplete="off" value={selectedCategory.title} />
            </Col>
          </Row>
          <Row style={{ width: "100%", marginBottom: "15px" }}>
            <Col span={8}>
              <Text>{t("am-category-icon")}</Text>
            </Col>
            <Col span={12}>
              <Glyph
                name={selectedCategory.icon}
                style={{ cursor: "pointer" }}
                onClick={handleUpdateIcon}
              />
            </Col>
          </Row>
        </Card>
        <Row style={{ width: "100%", maxHeight: "500px" }}>
          <ManagedList
            accordion
            title={`${t("am-places-list-of")} ${selectedCategory.title.toUpperCase()}`}
            items={selectedCategory.places}
            onAdd={handleAddPlace}
            onRemove={handleRemovePlace}
            onEdit={handlEditPlace}
            addTitleKey="am-add-place"
            chooseNameKey="am-choose-place-name"
            cell={(item) => <ReadOnlyPlace place={item} />}
          />
        </Row>
      </Row>
    </>
  );

  return (
    <>
      {GlyphSelectModal}
      {EditPlaceModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={20}>
              <SiteSelector
                value={siteId}
                onChange={setSiteId}
                size="large"
                style={{ width: "250px", marginBottom: "25px" }}
              />
            </Col>
            <Col span={4}>
              <Button block type="primary" onClick={handleSave}>
                {t("save")}
              </Button>
            </Col>
            <Col span={6}>
              <ManagedList
                selected={selectedCategory}
                items={categories}
                onSelect={(s) => {
                  setSelectedCategory(s);
                }}
                onAdd={handleAddCategory}
                onRemove={(item) => {
                  setCategories(categories.filter((cat) => cat.id !== item.id));
                }}
                addTitleKey="am-add-category"
                chooseNameKey="am-choose-category-name"
                cell={(item) => <Text>{item.title}</Text>}
              />
            </Col>
            <Col offset={2} span={16}>
              {selectedCategory && <Places />}
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default AroundMe;
