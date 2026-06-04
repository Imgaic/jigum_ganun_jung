import vrImagesData from "../../vr_images_mapping.json";

export interface VRPlaceImage {
  id: number;
  building: string;
  floor: string;
  name: string;
  sceneId: string;
  sceneName: string;
  imageUrl: string;
  isPlaceholder: boolean;
  placeholderReason?: string;
}

export const VR_IMAGES_MAPPING: VRPlaceImage[] = vrImagesData as VRPlaceImage[];
