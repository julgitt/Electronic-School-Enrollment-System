import {addProfile} from "../../../../shared/services/profileService.ts";
import withProfileForm from "../../hoc/withProfileForm.tsx";

const AddProfile = withProfileForm(addProfile);

export default AddProfile;
