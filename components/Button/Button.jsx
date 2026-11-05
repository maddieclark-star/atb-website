import "./Button.css";

const styles = {
  btn: "atbBtn",
  label: "atbBtnLabel",
  labelTrack: "atbBtnLabelTrack",
  icon: "atbBtnIcon",
  iconBare: "atbBtnIconBare",
  inactive: "atbBtnInactive",
  lg: "atbBtnLg",
  default: "atbBtnDefault",
  sm: "atbBtnSm",
  textLink: "atbBtnTextLink",
  light: "atbBtnLight",
  dark: "atbBtnDark",
  primary: "atbBtnPrimary",
  secondary: "atbBtnSecondary",
  noIcon: "atbBtnNoIcon",
};

const VARIANT_CLASS = {
  primary: styles.primary,
  secondary: styles.secondary,
  "text-link": styles.textLink,
};

const SIZE_CLASS = {
  lg: styles.lg,
  default: styles.default,
  sm: styles.sm,
};

const MODE_CLASS = {
  light: styles.light,
  dark: styles.dark,
};

function ArrowRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.175 13.0001H5C4.71667 13.0001 4.47917 12.9043 4.2875 12.7126C4.09583 12.5209 4 12.2834 4 12.0001C4 11.7168 4.09583 11.4793 4.2875 11.2876C4.47917 11.0959 4.71667 11.0001 5 11.0001H16.175L11.275 6.10011C11.075 5.90011 10.9792 5.66678 10.9875 5.40011C10.9958 5.13344 11.1 4.90011 11.3 4.70011C11.5 4.51678 11.7333 4.42094 12 4.41261C12.2667 4.40428 12.5 4.50011 12.7 4.70011L19.3 11.3001C19.4 11.4001 19.4708 11.5084 19.5125 11.6251C19.5542 11.7418 19.575 11.8668 19.575 12.0001C19.575 12.1334 19.5542 12.2584 19.5125 12.3751C19.4708 12.4918 19.4 12.6001 19.3 12.7001L12.7 19.3001C12.5167 19.4834 12.2875 19.5751 12.0125 19.5751C11.7375 19.5751 11.5 19.4834 11.3 19.3001C11.1 19.1001 11 18.8626 11 18.5876C11 18.3126 11.1 18.0751 11.3 17.8751L16.175 13.0001Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * ATB button — Primary / Secondary / Text link, in Large/Default/Small,
 * light/dark mode. Hover motion (label slide + colour swap) is pure CSS,
 * defined in Button.css.
 *
 * Renders an <a> when `href` is passed, otherwise a <button>. `icon` is
 * true for the default arrow, false for none, or an element to use in its
 * place (drawn in currentColor so it follows the hover colour swap).
 */
export default function Button({
  variant = "primary",
  size = "lg",
  mode = "light",
  disabled = false,
  icon = true,
  href,
  className = "",
  children,
  type = "button",
  ...rest
}) {
  const isTextLink = variant === "text-link";
  const showBareIcon = isTextLink || (variant === "secondary" && disabled);
  const Tag = href ? "a" : "button";

  const classes = [
    styles.btn,
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    MODE_CLASS[mode],
    !icon ? styles.noIcon : "",
    disabled ? styles.inactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const tagProps = href
    ? { href, "aria-disabled": disabled || undefined, tabIndex: disabled ? -1 : undefined }
    : { type, disabled: disabled || undefined };

  return (
    <Tag className={classes} {...tagProps} {...rest}>
      <span className={styles.label}>
        <span className={styles.labelTrack}>
          <span>{children}</span>
          <span>{children}</span>
        </span>
      </span>
      {icon && (
        <span className={`${styles.icon} ${showBareIcon ? styles.iconBare : ""}`}>
          {icon === true ? <ArrowRightIcon /> : icon}
        </span>
      )}
    </Tag>
  );
}
