#!/bin/bash

components=("AllUsers" "CreatePost" "EditPost" "PostDetails" "Profile" "UpdateProfile")

for component in "${components[@]}"; do
  code=$(cat <<EOF
const $component = () => {
  return (
    <div>$component</div>
  );
}

export default $component;
EOF
)
  echo "$code" > "$component.tsx"
done
