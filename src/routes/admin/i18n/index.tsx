import { Hono } from "hono";
import { GlobalConfigVariables } from "@core/middleware";
import views from "@routes/admin/i18n/views";
import mutations from "@routes/admin/i18n/mutations";

const i18nAdmin = new Hono<{
  Bindings: Env;
  Variables: GlobalConfigVariables;
}>();

i18nAdmin.route("/", views);
i18nAdmin.route("/", mutations);

export default i18nAdmin;